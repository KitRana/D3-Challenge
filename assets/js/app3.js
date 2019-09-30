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
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("opacity", function(opacity) {
            if (chosenXAxis === "age") {
                opacity = "0.7";
            }
            else if (chosenXAxis === "income") {
                opacity = "0.9";
            }
            else {
                opacity = "0.5";
            }
            return opacity;
        })
        .attr("cx", d => newXScale(d[chosenXAxis]));

    return circlesGroup;
}

function renderAbbr(abbrLabels, newXScale, chosenXAxis) {

    // abbrLabels.transition()
    //     .duration(1000)
    //     .attr("x", d => newXScale(d[chosenXAxis]));
    abbrLabels.attr("opacity", "0.2")
        .transition()
        .duration(1000)
        .attr("opacity", "1")
        .attr("x", d => newXScale(d[chosenXAxis]));


    return abbrLabels;
}

d3.csv("../assets/data/data.csv").then(function (csvData) {
    // console.log(csvData);

    csvData.forEach(function (data) {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
        data.income = +data.income;
        data.age = +data.age;
    });

    // var xLinearScale = d3.scaleLinear()
    //     .domain([8, d3.max(csvData, d => d.poverty)])
    //     .range([0, width]);

    var xLinearScale = xScale(csvData, chosenXAxis);

    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(csvData, d => d.healthcare)])
        .range([height, 0]);

    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    chartGroup.append("g")
        .call(leftAxis);

    var xAxis = chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .classed("x-axis", true)
        .call(bottomAxis);

    var circlesGroup = chartGroup.selectAll("circle")
        .data(csvData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d.healthcare))
        .attr("r", 15)
        .attr("fill", "purple")
        .attr("opacity", ".40");


    var abbrLabels = chartGroup.selectAll(null)
        .data(csvData)
        .enter()
        .append("text")
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d.healthcare))
        .text(d => d.abbr)
        // .attr("dx", "-9")
        .attr("dy", "5")
        .attr("font-size", "14")
        .attr("text-anchor", "middle")
        .attr("fill", "white");
    // .attr("stroke", "grey")

    var labelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    // var xAxisLabel = chartGroup.append("text")
    //     .attr("transform", `translate (${width / 2}, ${height + 50})`)
    //     .text("Poverty (%)")

    var povertyLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("Poverty (%)");

    var ageLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Age (Median)");

    var incomeLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("Household Income (Median)");

    var yAxisLabel = chartGroup.append("text")
        // .attr("transform", `translate(${width - width - 100})`)
        .attr("transform", "rotate(-90)")
        .attr("y", margin.top - 80)
        .attr("x", 0 - height / 2)
        .classed("axis-text", true)
        // .attr("dy", "-8")
        .attr("text-anchor", "middle")
        .text("Lacks Healthcare (%)")

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        .html(function (d) { return `State: ${d.state} <br> Poverty: ${d.poverty}% <br> Obesity: ${d.obesity}%` })
    svg.call(toolTip);

    abbrLabels.on("mouseover", toolTip.show)
        .on("mouseout", toolTip.hide);

    // var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

    // x axis labels event listener
    labelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {

                // replaces chosenXAxis with value
                chosenXAxis = value;

                // console.log(chosenXAxis)

                // functions here found above csv import
                // updates x scale for new data
                xLinearScale = xScale(csvData, chosenXAxis);

                // updates x axis with transition
                xAxis = renderAxes(xLinearScale, xAxis);

                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

                // updates tooltips with new info
                // circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
                abbrLabels = renderAbbr(abbrLabels, xLinearScale, chosenXAxis);

                // changes classes to change bold text
                if (chosenXAxis === "age") {
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenXAxis === "income") {
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
                else {
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
            }
        });
})




