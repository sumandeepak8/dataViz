const margin = {
    right: 10,
    left: 100,
    top: 10,
    bottom: 150,
};

const chartSize = {
    width: 800,
    height: 600,
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

const drawQuotes = function (quotes) {
    const g = d3.select('g');
    const fq = quotes[0];
    const lq = quotes[quotes.length - 1];

    const y = d3.scaleLinear()
        .domain([0, _.maxBy(quotes, selectedField)[selectedField]]).range([height, 0]);

    const x = d3.scaleTime()
        .range([0, width])
        .domain([new Date(fq.Date), new Date(lq.Date)]);

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

    const line = d3.line()
        .x(b => x(b.Date))
        .y(b => y(b.Close))

    g.append('path')
        .attr('class', 'close')
        .attr('d', line(quotes));
}

const calculateAverage = function (quotes) {
    let total = 0;
    return function (quote) {
        let startIndex = 0;
        let finalIndex = startIndex + total + 1;
        let count = total;

        if (total >= 100) {
            const dividend = Math.floor(total / 99) * 99;
            startIndex = dividend - (100 - (total % dividend)) + 1;
            finalIndex = startIndex + 100;
            count = 100;
        }
        total = total + 1;
        quote.Average = quotes.slice(startIndex, finalIndex)
            .reduce((acc, x) => acc + x[selectedField], 0) / count;
    }
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
        const mapper = calculateAverage(quotes);
        quotes.forEach(mapper);
        intiChart();
        drawQuotes(quotes);
    });
}

window.onload = main;
