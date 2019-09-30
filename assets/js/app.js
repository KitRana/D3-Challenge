// @TODO: YOUR CODE HERE!

// Create svg element to define the canvas
var svgWidth = 900;
var svgHeight = 500;

// set the margins
var margin = {
    top: 40,
    right: 150,
    bottom: 80,
    left: 60
};

// set plot size to account for margins
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

d3.csv("../assets/data/data.csv").then(function(csvData){
    // console.log(csvData);

    csvData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        data.obesity = +data.obesity;
    });

    var xLinearScale = d3.scaleLinear()
        .domain([8, d3.max(csvData, d => d.poverty)])
        .range([0, width]);

    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(csvData, d => d.healthcare)])
        .range([height, 0]);

    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    chartGroup.append("g")
        .call(leftAxis);

    chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis); 

    var circlesGroup = chartGroup.selectAll("circle")
        .data(csvData)
        .enter()
        .append("circle")
            .attr("cx", d => xLinearScale(d.poverty))
            .attr("cy", d => yLinearScale(d.healthcare))
            .attr("r", "15")
            .attr("fill", "purple")
            .attr("opacity", ".40");


    var abbrLabels = chartGroup.selectAll(null)
        .data(csvData)
        .enter()
        .append("text")
            .attr("x", d => xLinearScale(d.poverty))
            .attr("y", d => yLinearScale(d.healthcare))
                .text(d => d.abbr)
                    // .attr("dx", "-9")
                    .attr("dy", "5")
                    .attr("font-size", "14")
                    .attr("text-anchor", "middle")
                    .attr("fill", "white");
                    // .attr("stroke", "grey")

    var xAxisLabel = chartGroup.append("text")
        .attr("transform", `translate (${width / 2}, ${height + 50})`)
        .text("Poverty (%)")

    var yAxisLabel = chartGroup.append("text")
        // .attr("transform", `translate(${width - width - 100})`)
        .attr("transform", "rotate(-90)")
        .attr("y", margin.top - 80)
        .attr("x", 0 - height / 2)
        // .attr("dy", "-8")
        .attr("text-anchor", "middle")
        .text("Lacks Healthcare (%)")

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        .html(function(d) {return `State: ${d.state} <br> Poverty: ${d.poverty}% <br> Obesity: ${d.obesity}%`})
    svg.call(toolTip);

    abbrLabels.on("mouseover", toolTip.show)
        .on("mouseout", toolTip.hide);

})

var chosenXAxis = "poverty";

// function used for updating x-scale var upon click on axis label
function xScale(csvData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(csvData, d => d[chosenXAxis]) * 0.8,
        d3.max(csvData, d => d[chosenXAxis]) * 1.2
        ])
        .range([0, width]);

    return xLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXaxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));

    return circlesGroup;
}


