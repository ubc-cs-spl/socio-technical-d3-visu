(function() {
vis = {}

//===================================================
//---------------------Globals----------------------- 
//===================================================

//Dimensions / Size
var margin, width, height;
var chart,svg;
var x,y;
var datePrinter = d3.time.format("%x");
//==============end of global declaration===========


vis.init = function(params) {
   if (!params) {params = {}}

   chart = d3.select(params.chart||"#chart"); // placeholder div for svg
   margin = {top: 40, right: 40, bottom: 40, left: 60};
   width  = ( params.width  || 1060 ) - margin.left - margin.right;
   height = ( params.height || 500 ) - margin.top - margin.bottom;

   chart.selectAll("svg")
			.data([{width:width,height:height}])
			.enter()
			.append("svg");

   // vis.init can be re-ran to pass different height/width values 
   // to the svg. this doesn't create new svg elements. 	  

   svg = d3.select("svg").attr({
  		width: function(d) {return d.width  + margin.left + margin.right},
  		height:function(d) {return d.height + margin.top + margin.bottom}
		})
   .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

   svg.append("rect")
      .style("stroke", "black")
      .style("fill", "#F5F5F5")
      .style("stroke-width", 1)
      .attr("width" , width)
      .attr("height", height);

   // Holds defs like clippath
   var defs = svg.append("defs");
       	defs.append("clipPath")
          .attr("id", "mainclip")
        .append("rect")
          .attr("width", width)
          .attr("height", height);

  // tooltip
  tip = d3.tip().attr('class', 'd3-tip').html(function(d) { return datePrinter(d.date);})
  tip.direction('n');
  tip.offset([-5, 0])
  svg.call(tip)

  // -------------------------
  // Set up scales + axis
  // -------------------------

  //---------------
  // Make date objects
  params.data.forEach(function(d){
    d.date = new Date(d.date);
  })
  params.redline = new Date(params.redline)
  //---------------

  var xmin = d3.min(params.data,function(d){return d.date});
  var xmax = d3.max(params.data,function(d){return d.date});

  x = d3.time.scale().domain([d3.time.day.offset(xmin, -2), d3.time.day.offset(xmax, 2)]).range([0, width]);
  
  // Ordinal scale, hardcoded for now
  y = d3.scale.ordinal()
  .domain(["offset",
           "1a",
           "1b",
           "2a",
           "2b",
           "3a",
           "3b",
           "4a",
           "4b",
           "5a",
           "5b",
           "6a",
           "6b"]).rangeBands([0,height]);


  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickSize(-height);

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickValues(y.domain().filter(function(d, i) { return !(i % 2); })) //Hide every second tick
    .tickSize(-width+1).
    tickFormat(function (d) {
      var mapper = {
       "offset":"",
       "1b": "111657",
       "2b": "25910",
       "3b": "147183",
       "4b": "98182",
       "5b": "4866",
       "6b": "23532",
      }
    return mapper[d]
  });

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0, "+ height +")")
    .call(xAxis);
 
  svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);

  // Style
  d3.selectAll(".y line")
  	.style("stroke-width",4)
  	.style("stroke","white");
  // -------------------------

  // -------------------------
  // Add datapoints
  // -------------------------
  var dataPoints = svg.append("g")
  		.attr("id", "dataPointsGroup")
  		.attr("clip-path", "url(#mainclip)");

  var shapes = dataPoints.selectAll(".datapoints")
   	.data(params.data).enter();
   
   // Append circles
   shapes.append("path")
      .attr("class", "shapes")
      .style("stroke-width", 1.2)
      .style("stroke", "black")
      .attr("transform", function(d) { return "translate(" + x(d.date) + "," + y(d.ycoord) + ")"; })
      .each(function(d){
        var path = d3.select(this);

        // "a" type get green colour "b" type get blue colour
        var colour = "#00695C";
        if (d.ycoord.indexOf("b") != -1) colour = "#0277BD";

        // Save so highlight can return to default colour
        d.colour = colour

        // eg Commit
        if (d.type == 0) {
          path.attr("d", d3.svg.symbol().type("circle").size(128)).style("fill", d.colour);
          path.classed("circle")
        }
        // eg Pull
        if (d.type == 1) {
          path.attr("d", d3.svg.symbol().type("square").size(128)).style("fill", d.colour);
          path.classed("square")
        }
      })
      .on("mouseover", function(d) { 
          d3.select(this).style("stroke", "#F44336"); 
          d3.select(this).style("stroke-width", 2.5); 
        })
      .on("mouseout",  function(d) { 
          d3.select(this).style("stroke", "black"); 
          d3.select(this).style("stroke-width", 1); 
        })
      .on("mouseover.tooltip", tip.show)
      .on("mouseout.tooltip", tip.hide)
      .on("dblclick", function(d){
        window.open("http://www.github.com",'_blank');
      });
      
      

  // // Append triangles
  //  shapes.append("path")
  //  	.filter(function(d) { return d.type == 2 })
  //  	  .attr("class", "shapes triangle")
  //     .attr("transform", function(d) { return "translate(" + x(d.date) + "," + y(d.ycoord) + ")"; })
  //     .attr("d", d3.svg.symbol().type("triangle-up"))
  //     .style("fill", "#651FFF");
  // -------------------------


  // -------------------------
  // Add red line
  // -------------------------

    var line = d3.svg.line()
      .x(function(d) { return x(d.x);})
      .y(function(d) { return d.y;})
      .interpolate("linear");

    var lineData = [[{"x": params.redline,"y": 0},{"x": params.redline,"y":height}]]
    
    dataPoints.selectAll(".line")
      .data(lineData)
    .enter().append("path")
      .attr("class", "line")
      .attr("d", line)
      .attr("stroke", "#F44336")
      .style("stroke-dasharray", ("3, 3")) 
      .style("opacity", .75) 
      .attr("stroke-width", 4);
  // -------------------------
  

  // -------------------------
  // Add zoom
  // -------------------------
  var zoom = d3.behavior.zoom()
      .x(x)
      .scaleExtent([1, 100])
      .on("zoom", zoomed);

  svg.call(zoom)

  function zoomed() {

	  var t = zoom.translate();
	  var s = zoom.scale();

	  //prevent translation/zoom from exceeding bounds
	  tx = Math.min(0, Math.max(width * (1 - s), t[0]));
	  zoom.translate([tx, 0]);

	  // Update Axis
	  svg.select(".x.axis").call(xAxis);
	  // Update points
	  dataPoints.selectAll(".shapes")
       .attr("transform", function(d) { return "translate(" + x(d.date) + "," + y(d.ycoord) + ")"; });    

    dataPoints.selectAll('.line').attr("d", line)
	}       
}
// -------------------------
})();