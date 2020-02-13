const drawCompanies = (companiesData) => {
    setInterval(() => {
        d3.select("svg").remove();
        const toLine = b => `<strong>${b.name}</strong> <i>${b.value}</i>`;
        const chartData = document.querySelector('#chart-data');
        const chartArea = d3.select('#chart-area');
        const fields = ["CMP", "PE", "MarketCap", "DivYld", "QNetProfit", "QSales", "ROCE"];
        const value = fields[Math.floor(Math.random() * fields.length)];

        const Companies = companiesData.map((company => {
            return {
                name: company.Name,
                value: company[value]
            }
        }))

        const colors = d3.schemeAccent;

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

        chartArea
            .append("svg")
            .attr("height", chartSize.height)
            .attr("width", chartSize.width)
            .attr("fill", "grey")
            .attr("scale", "linear");

        const width = chartSize.width - (margin.left + margin.right);
        const height = chartSize.height - (margin.top + margin.bottom);

        const svg = d3.select("svg");
        const g = svg.append("g");
        g.append("text")
            .text("companies")
            .attr("x", width / 2)
            .attr("y", height + 140)
            .attr("class", "x axis-label");

        g.append("text")
            .attr("class", "y axis-label")
            .text(value)
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -60);

        const y = d3.scaleLinear()
            .domain([0, _.maxBy(Companies, "value").value]).range([height, 0]);

        const x = d3.scaleBand()
            .range([0, width])
            .domain(_.map(Companies, "name"))
            .padding(0.3);

        const xAxis = d3.axisBottom(x);
        g.append("g")
            .call(xAxis)
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${height})`);

        g.selectAll(".x-axis text")
            .attr("transform", "rotate(-40)")
            .attr("x", -5)
            .attr("y", 10);

        const yAxis = d3.axisLeft(y).tickFormat(d => d).ticks(6);

        g.append("g")
            .call(yAxis)
            .attr("class", "y-axis");

        g.attr("transform", `translate(${margin.left}, ${margin.top})`);

        g.selectAll("rect").remove();
        const rectangles = g.selectAll("rect").data(Companies);
        const newRects = rectangles.enter();
        newRects.append("rect")
            .attr("x", b => x(b.name))
            .attr('y', b => y(b.value))
            .attr("width", x.bandwidth)
            .attr("height", b => height - y(b.value))
            .attr("fill", (b, i) => colors[i]);

        chartData.innerHTML = Companies.map(toLine).join('<hr/>');
    }, 1000)
}

const parseCompany = function (company) {
    const others = Object.keys(company).filter(e => e !== "Name")
    others.forEach(header => company[header] = +company[header])
    return company;
}

const main = () => {
    document.querySelector('#chart-area').innerHTML = "";
    d3.csv("./data/companies.csv", parseCompany).then(drawCompanies);
}

window.onload = main;