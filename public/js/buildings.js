const drawBuildings = (buildings) => {
  const toLine = b => `<strong>${b.name}</strong> <i>${b.height}</i>`;
  const chartData = document.querySelector('#chart-data');
  const chartArea = d3.select('#chart-area');

  const margin = {
    right: 10,
    left: 100,
    top: 10,
    bottom: 150,
  };

  const chartSize = {
    width: 600,
    height: 400,
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
    .text("tall building")
    .attr("x", width / 2)
    .attr("y", height + 140)
    .attr("class", "x axis-label");

  g.append("text")
    .attr("class", "y axis-label")
    .text("Height (m)")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -60);

  const y = d3.scaleLinear()
    .domain([0, d3.max(buildings).height]).range([height, 0]);

  const x = d3.scaleBand()
    .range([0, width])
    .domain(_.map(buildings, "name"))
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

  const yAxis = d3.axisLeft(y).tickFormat((d) => d + "m").ticks(3);

  g.append("g")
    .call(yAxis)
    .attr("class", "y-axis");

  g.attr("transform", `translate(${margin.left}, ${margin.top})`);

  const rectangles = g.selectAll("rect").data(buildings);

  const newRects = rectangles.enter();
  newRects.append("rect")
    .attr("x", b => x(b.name))
    .attr('y', b => y(b.height))
    .attr("width", x.bandwidth)
    .attr("height", b => height - y(b.height))
    .attr("fill", "grey");

  chartData.innerHTML = buildings.map(toLine).join('<hr/>');
}

const main = () => {
  d3.csv('data/buildings.json').then(drawBuildings);
}
window.onload = main;