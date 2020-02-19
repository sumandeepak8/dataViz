let length = 8;
let needToCreate = false;

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

const colors = d3.schemeAccent;

const initChart = function (selectedField) {
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
        .text("companies")
        .attr("x", width / 2)
        .attr("y", height + 140)
        .attr("class", "x axis-label");

    g.append("text")
        .attr("class", "y axis-label")
        .text(selectedField)
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -60);

    g.attr("transform", `translate(${margin.left}, ${margin.top})`);
}

const yAxisLabel = (companies, selectedField) => d3.scaleLinear()
    .domain([0, _.maxBy(companies, selectedField)[selectedField]]).range([height, 0]);

const xAxisLabel = (companies) => d3.scaleBand()
    .range([0, width])
    .domain(_.map(companies, "Name"))
    .padding(0.3);

const drawCompanies = (companies, selectedField) => {
    const toLine = b => `<strong>${b.Name}</strong> <i>${b[selectedField]}</i>`;
    const chartData = document.querySelector('#chart-data');
    const g = d3.select("g");
    const rectangles = g.selectAll("rect").data(companies);
    const newRects = rectangles.enter();

    const y = yAxisLabel(companies, selectedField);
    const x = xAxisLabel(companies);
    newRects.append("rect")
        .attr("x", b => x(b.Name))
        .attr('y', b => y(b[selectedField]))
        .attr("width", x.bandwidth)
        .attr("height", b => height - y(b[selectedField]))
        .attr("fill", (b, i) => colors[i]);
    chartData.innerHTML = companies.map(toLine).join('<hr/>');
}

const updateCompanies = function (companies, selectedField) {
    const svg = d3.select("#chart-area svg");
    svg.select(".y.axis-label").text(selectedField);

    const t = d3
        .transition()
        .duration(1000)
        .ease(d3.easeLinear);

    const g = d3.select("g");
    const y = yAxisLabel(companies, selectedField)
    const x = xAxisLabel(companies);
    const xAxis = d3.axisBottom(x);
    svg.select('.x-axis').call(xAxis);

    svg.selectAll(".x-axis text")
        .attr("transform", "rotate(-40)")
        .attr("x", -5)
        .attr("y", 10);

    const yAxis = d3.axisLeft(y).tickFormat(d => d).ticks(6);

    svg.select(".y-axis").call(yAxis);

    svg
        .selectAll("rect")
        .transition(t)
        .attr("y", c => y(c[selectedField]))
        .attr("height", b => height - y(b[selectedField]))
        .attr("x", c => x(c.Name))
        .attr("width", x.bandwidth);

    svg
        .selectAll("rect")
        .data(companies, c => c.Name)
        .exit()
        .remove()
        .transition(t);
};

const parseCompany = function (company) {
    const others = Object.keys(company).filter(e => e !== "Name")
    others.forEach(header => company[header] = +company[header])
    return company;
}

const frequentlyMoveCompanies = (src, dest) => {
    setInterval(() => {
        const c = src.shift();
        if (c) dest.push(c);
        else[src, dest] = [dest, src];
    }, 1000);
}

const main = () => {
    const fields = ["CMP", "PE", "MarketCap", "DivYld", "QNetProfit", "QSales", "ROCE"];
    const selectedField = fields[Math.floor(Math.random() * fields.length)];

    d3.csv("data/companies.csv", parseCompany).then(companies => {
        initChart(selectedField);
        drawCompanies(companies, selectedField);
        setInterval(() => {
            const selectedField = fields[Math.floor(Math.random() * fields.length)];
            updateCompanies(companies, selectedField);
        }, 1000);
    });
}

window.onload = main;