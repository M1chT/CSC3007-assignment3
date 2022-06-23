function compileData(sgmap, population) {
    let min = 0;
    let max = 0;
    let finalData = {}

    sgmap.features.forEach((feature) => {
      population.forEach((zone) => {
        if (
          feature.properties.Name.toUpperCase() == zone.Subzone.toUpperCase()
        ) {
          finalData[feature.properties.Name] = parseInt(zone.Population);

          if (zone.Population != "-" || min > parseInt(zone.Population) || min == 0) {
            min = parseInt(zone.Population)
          }

          if (max < parseInt(zone.Population) || max == 0) {
            max = parseInt(zone.Population)
          }
        }
      });
    });

    return [finalData, min, max]
  }

let width = 1400, height = 600;

let svg = d3.select("svg")
    .attr("viewBox", "0 0 " + width + " " + height)

// Load external data
Promise.all([d3.json("data/sgmap.json"), d3.csv("data/population2021.csv")]).then(data => {

console.log(data[0]);
console.log(data[1]);

listOfData = compileData(data[0], data[1])

let myColor = d3.scaleQuantize()
    .domain([listOfData[1], listOfData[2]])
    .range(d3.schemeReds[7]);

// Map and projection
var projection = d3.geoMercator()
    .center([103.851959, 1.290270])
    .fitExtent([[20, 20], [980, 580]], data[0]);

let geopath = d3.geoPath().projection(projection);

var legend = d3.legendColor()
    .labels([listOfData[1], listOfData[2]])
    .shapePadding(4)
    .scale(myColor)
    .title("Population of Singapore")

svg.select(".legendThreshold")
    .call(legend);

let mouseOver = function(event,d) {
   
    d3.select(".tooltip")
      .transition()
      .duration(200)
      .style("opacity", 1)
      .text(d.properties.Name + " Population: " + listOfData[0][d.properties.Name])
    d3.select(this)
      .transition()
      .duration(200)
      .style("opacity", 1)
      .style("stroke", "black")

  }

let mouseLeave = function(event,d) {
d3.selectAll(".tooltip")
    .transition()
    .duration(200)
    .style("opacity", .8)
    .text(" ")
d3.select(this)
    .transition()
    .duration(200)
    .style("stroke", "transparent")
}

// Legend
var g = svg.append("g")
    .attr("class", "legendThreshold")
    .attr("transform", "translate(20,20)");
g.append("text")
    .attr("class", "caption")
    .attr("x", 0)
    .attr("y", -6)
    .text("Singapore Population");

var legend = d3.legendColor()
    .labels([listOfData[1], listOfData[2]])
    .shapePadding(4)
    .scale(myColor);
svg.select(".legendThreshold")
    .call(legend);

svg.append("g")
    .selectAll("path")
    .data(data[0].features)
    .enter()
    .append("path")
    .attr("d", geopath)
    .attr("fill", function(d) {
        d.total = listOfData[0][d.properties.Name] || 0;
        return myColor(d.total);
      })
    .on("mouseover", mouseOver)
    .on("mouseleave", mouseLeave )

})