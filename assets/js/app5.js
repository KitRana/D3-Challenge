// @TODO: YOUR CODE HERE!

// Create svg element to define the canvas
var svgWidth = 900;
var svgHeight = 500;

// set the margins
var margin = {
    top: 40,
    right: 150,
    bottom: 80,
    left: 150
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
var chosenYAxis = "healthcare";

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

function yScale(csvData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(csvData, d => d[chosenYAxis]) * .7,
        d3.max(csvData, d => d[chosenYAxis]) * 1.2
        ])
        .range([height, 0]);

    return yLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

function renderAxes2(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("opacity", function (opacity) {
            if (chosenYAxis === "obesity") {
                opacity = "0.7";
            }
            else if (chosenYAxis === "smokes") {
                opacity = "0.8";
            }
            else {
                opacity = "0.9";
            }
            return opacity;
        })
        .attr("fill", function (fill) {
            if (chosenXAxis === "age") {
                fill = "RoyalBlue";
            }
            else if (chosenXAxis === "income") {
                fill = "RebeccaPurple";
            }
            else {
                fill = "Salmon";
            }
            return fill;
        })
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
}

function renderAbbr(abbrLabels, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    // abbrLabels.transition()
    //     .duration(1000)
    //     .attr("x", d => newXScale(d[chosenXAxis]));
    abbrLabels.attr("opacity", "0.2")
        .transition()
        .duration(1000)
        .attr("opacity", "1")
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => newYScale(d[chosenYAxis]));


    return abbrLabels;
}

function toolTipUpdate(chosenXAxis, chosenYAxis, circlesGroup) {

    if (chosenXAxis === "poverty") {
        var xTipLabel = "Poverty (%):";
    }
    else if (chosenXAxis === "income") {
        var xTipLabel = "Household Income ($):";
    }
    else {
        var xTipLabel = "Age:";
    }

    if (chosenYAxis === "healthcare") {
        var yTipLabel = "Lacking Healthcare:"
    }
    else if (chosenYAxis === "obesity") {
        var yTipLabel = "Obese:"
    }
    else {
        var yTipLabel = "Smokes:"
    }

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        .html(function (d) {
            return `State: ${d.state} <br> ${xTipLabel} ${d[chosenXAxis]} <br> ${yTipLabel} ${d[chosenYAxis]}%`
        });
    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", toolTip.show)
        .on("mouseout", toolTip.hide);

    return circlesGroup;
}

function titleUpdate(chosenXAxis, chosenYAxis, title) {

    if (chosenXAxis === "poverty") {
        var xTitle = "Poverty";
    }
    else if (chosenXAxis === "income") {
        var xTitle = "Household Income";
    }
    else {
        var xTitle = "Age";
    }

    if (chosenYAxis === "healthcare") {
        var yTitle  = "People Lacking Healthcare"
    }
    else if (chosenYAxis === "obesity") {
        var yTitle = "Obesity"
    }
    else {
        var yTitle = "Smokers"
    }

    title.transition()
        .duration(2000)
        .text(`${xTitle} vs. ${yTitle}`);

    return title;
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
    var yLinearScale = yScale(csvData, chosenYAxis);

    // var yLinearScale = d3.scaleLinear()
    //     .domain([0, d3.max(csvData, d => d[chosenYAxis])])
    //     .range([height, 0]);

    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
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
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 15)
        .attr("fill", "Salmon");
    // .attr("opacity", ".90");


    var abbrLabels = chartGroup.selectAll(null)
        .data(csvData)
        .enter()
        .append("text")
        .classed("abbr", true)
        // .classed("abbrlabels", true)
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]))
        .text(d => d.abbr)
        // .attr("dx", "-9")
        .attr("dy", "5")
        .attr("font-size", "14")
        .attr("text-anchor", "middle")
        .attr("fill", "white");
    // .attr("stroke", "grey")

    var labelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var title = chartGroup.append("text")
        // .attr("transform", `translate (${width / 2}, ${height + 50})`)
        .attr("x", `${(width / 2)}`)
        .attr("y", 10)
        .attr("text-anchor", "middle")
        .classed("title", true)
        .text("Poverty (%) v. Lacks Healthcare (%)")

    var povertyLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .classed("axis-text", true)
        .text("Poverty (%)");

    var ageLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .classed("axis-text", true)
        .text("Age (Median)");

    var incomeLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .classed("axis-text", true)
        .text("Household Income (Median)");

    var labelsGroup2 = chartGroup.append("g")
        // .attr("transform", `translate(${width - width - 100})`)
        .attr("transform", `translate(${0 - margin.left / 4}, ${(height / 2)})`);

    var healthcareLabel = labelsGroup2.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -20)
        .attr("x", 0 - height / 20)
        .classed("axis-text", true)
        .classed("active", true)
        .attr("value", "healthcare")
        // .attr("dy", "-8")
        .attr("text-anchor", "middle")
        .text("Lacks Healthcare (%)")

    var smokesLabel = labelsGroup2.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -40)
        .attr("x", 0 - height / 20)
        .classed("axis-text", true)
        .classed("inactive", true)
        .attr("value", "smokes")
        // .attr("dy", "-8")
        .attr("text-anchor", "middle")
        .text("Smokes (%)")

    var obeseLabel = labelsGroup2.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -60)
        .attr("x", 0 - height / 20)
        .classed("axis-text", true)
        .classed("inactive", true)
        .attr("value", "obesity")
        // .attr("dy", "-8")
        .attr("text-anchor", "middle")
        .text("Obese (%)")

    var circlesGroup = toolTipUpdate(chosenXAxis, chosenYAxis, circlesGroup);

    // var h2Group = d3.selectAll(".article")
    //     .append("h2")
    //     .text("Correlations Discovered Between Various Risk Factors");

    // var pGroup = d3.selectAll(".article")
    //     .append("p")
    //     .text(`This is a text paragraph.`);

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
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // updates tooltips with new info

                abbrLabels = renderAbbr(abbrLabels, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                circlesGroup = toolTipUpdate(chosenXAxis, chosenYAxis, circlesGroup);

                title = titleUpdate(chosenXAxis, chosenYAxis, title);

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
    labelsGroup2.selectAll("text")
        .on("click", function () {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenYAxis) {

                // replaces chosenXAxis with value
                chosenYAxis = value;

                // console.log(chosenXAxis)

                // functions here found above csv import
                // updates x scale for new data
                yLinearScale = yScale(csvData, chosenYAxis);

                // updates x axis with transition
                yAxis = renderAxes2(yLinearScale, yAxis);

                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                // circlesGroup.attr("fill", "red")
                // updates tooltips with new info
                // circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
                abbrLabels = renderAbbr(abbrLabels, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                circlesGroup = toolTipUpdate(chosenXAxis, chosenYAxis, circlesGroup);

                title = titleUpdate(chosenXAxis, chosenYAxis, title);

                // changes classes to change bold text
                if (chosenYAxis === "smokes") {
                    smokesLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obeseLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenYAxis === "obesity") {
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obeseLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
                else {
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    obeseLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
            }
        });
})
