const margin = {
    right: 10,
    left: 100,
    top: 10,
    bottom: 150,
};

const chartSize = {
    width: 1120,
    height: 700,
};

const width = chartSize.width - (margin.left + margin.right);
const height = chartSize.height - (margin.top + margin.bottom);

const selectedField = "Close"

const intiChart = function () {
    const chartArea = d3.select('#chart-area');
    chartArea
        .append("svg")
        .attr("height", chartSize.height)
        .attr("width", chartSize.width)
        .attr("fill", "grey")
        .attr("scale", "linear");

    const svg = d3.select("svg");
    const g = svg.append("g");

    g.append("text")
        .text("Quotes")
        .attr("x", width / 2)
        .attr("y", height + 140)
        .attr("class", "x axis-label");

    g.append("text")
        .attr("class", "y axis-label")
        .text(selectedField)
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -60);
}

const drawQuotes = function (quotes, quotesWithAverage) {
    const g = d3.select('g');
    g.selectAll('g').remove();
    g.selectAll('path').remove();

    const fq = quotes[0];
    const lq = quotes[quotes.length - 1];

    const y = d3.scaleLinear()
        .domain([0, _.maxBy(quotes, selectedField)[selectedField]]).range([height, 0]);

    const x = d3.scaleTime()
        .range([0, width])
        .domain([fq.Date, lq.Date]);

    const xAxis = d3.axisBottom(x);
    g.append("g")
        .call(xAxis)
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height})`);

    g.selectAll(".x-axis text")
        .attr("transform", "rotate(-40)")
        .attr("x", -5)
        .attr("y", 10);

    const yAxis = d3.axisLeft(y);

    g.append("g")
        .call(yAxis)
        .attr("class", "y-axis");

    g.attr("transform", `translate(${margin.left}, ${margin.top})`);

    const line = key => d3.line()
        .x(b => x(b.Date))
        .y(b => y(b[key]))

    g.append('path')
        .attr('class', 'close')
        .attr('d', line('Close')(quotes));

    g.append('path')
        .attr('class', 'average')
        .attr('d', line('Average')(quotesWithAverage));
}

const getProfitOrLoss = transaction =>
    Math.round(transaction.buy.Close - transaction.sell.Close);

const getSrNum = (x = 1) => (() => x++);

const getTableofStatistics = function (transactions) {

    let quotesOfProfit = transactions.filter(x => getProfitOrLoss(x) >= 0);
    let quotesOfLoss = transactions.filter(x => getProfitOrLoss(x) < 0);

    let totalQuotesOfProfit = quotesOfProfit.length;
    let totalQuotesOfLoss = quotesOfLoss.length;

    let totalProfit = quotesOfProfit.reduce((acc, x) => (acc + getProfitOrLoss(x)), 0);
    let totalLoss = quotesOfLoss.reduce((acc, x) => (acc + getProfitOrLoss(x)), 0);

    let averageOfProfit = totalProfit / totalQuotesOfProfit;
    let averageOfLoss = totalLoss / totalQuotesOfLoss;

    let expectancy = totalProfit / transactions.length;

    return {
        totalLoss,
        totalProfit,
        totalQuotesOfLoss,
        totalQuotesOfProfit,
        averageOfLoss,
        averageOfProfit,
        expectancy,
    }
}

const getTableOfAllTransaction = function (transactions) {
    const newRows = d3.select("#transaction-to-buy")
        .selectAll("tr")
        .data(transactions)
        .enter()
        .append("tr");

    newRows.append("td")
        .html(getSrNum());
    newRows.append("td")
        .html(transaction => transaction.buy.Close);
    newRows.append("td")
        .html(transaction => transaction.sell.Close);
    newRows.append("td")
        .html(x => getProfitOrLoss(x));
}

//buy : when average is low and price is above than average
//sell : when average is high and price is below than average

const getProfitableQuotes = (quotes) => {
    let profitableQuotes = quotes
        .reduce((acc, quote) => {
            if (quote.Average <= quote.Close && acc.canBuy) { //buy
                acc.transactions.push({ "buy": quote });
                acc.canBuy = false;
                return acc
            }
            if (quote.Average > quote.Close && !acc.canBuy) {
                _.last(acc.transactions)["sell"] = quote;
                acc.canBuy = true;
                return acc;
            }
            return acc;
        }, { transactions: [], canBuy: true })

    profitableQuotes.canBuy ? '' : profitableQuotes.transactions.pop();
    return profitableQuotes;
};

const calculateAverage = function (quotes) {
    let numberOfQuotes = 99;
    quotes.forEach((quote, index) => {
        if (index >= numberOfQuotes)
            quote.Average = (quotes.slice(index - numberOfQuotes, index++)
                .map(quote => quote.Close)
                .reduce((a, b) => a + b))
                / 100;
    })
    return quotes.slice(100);
}

const parseQuote = function (quote) {
    const others = Object.keys(quote);
    others.forEach(header => {
        if (header === "Date")
            quote[header] = new Date(quote[header]);
        else
            quote[header] = +quote[header]
    })
    return quote;
}

const main = () => {
    d3.csv("data/nifty-data.csv", parseQuote).then(quotes => {
        var slider = createD3RangeSlider(0, 100, "#slider-container");
        slider.range(1, 100);

        intiChart();
        const quotesWithAverage = calculateAverage(quotes);
        const profitableQuotes = getProfitableQuotes(quotesWithAverage);

        drawQuotes(quotes, quotesWithAverage, profitableQuotes);
        getTableOfAllTransaction(profitableQuotes.transactions);
        console.log("statistics ", getTableofStatistics(profitableQuotes.transactions));
        slider.onChange(({ begin, end }) => {
            let ratio = Math.round(quotes.length / 100);
            let startIndex = begin * ratio;
            let lastIndex = end * ratio;

            let startDate = quotes[startIndex].Date.toDateString();
            let endDate = quotes[lastIndex].Date.toDateString();

            d3.select("#range-label").text(startDate + " - " + endDate);
            let quotesOfRange = quotes.slice(startIndex, lastIndex);
            let quotesWithAverageOfRange = quotesWithAverage.slice(startIndex, lastIndex);
            drawQuotes(quotesOfRange, quotesWithAverageOfRange);
        });

    });
}

window.onload = main;