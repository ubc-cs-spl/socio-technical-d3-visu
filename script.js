(function() {
vis = {}

//===================================================
//---------------------Globals----------------------- 
//===================================================

//Dimensions / Size
var margin, width, height;
var chart,svg;
var x,y;
//==============end of global declaration===========


vis.init = function(params) {
   if (!params) {params = {}}

   chart = d3.select(params.chart||"#chart"); // placeholder div for svg
   margin = {top: 40, right: 40, bottom: 40, left: 40};
   width  = ( params.width  || 960 ) - margin.left - margin.right;
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
  
  // -------------------------
  // Set up scales + axis
  // -------------------------
  var xmax = d3.max(params.data,function(d){return d.xcoord})*1.05;
  var ymax = d3.max(params.data,function(d){return d.ycoord})*1.05;

  x = d3.scale.linear()
    .range([0, width]).domain([0,xmax]);

  // Offset by 3 pixels to preserve black border
  y = d3.scale.linear()
    .range([height-3, 0]).domain([0,ymax]);

  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickSize(-height);

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(6)
    .tickSize(-width+1);
    // .outerTickSize(0);

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
   
   shapes.append("path")
   	.filter(function(d) { return d.type == 0 })
   	  .attr("class", "shapes circle")
      .attr("transform", function(d) { return "translate(" + x(d.xcoord) + "," + y(d.ycoord) + ")"; })
      .attr("d", d3.svg.symbol().type("circle"))
      .style("fill", "#00695C");

   shapes.append("path")
   	.filter(function(d) { return d.type == 1 })
   	  .attr("class", "shapes square")
      .attr("transform", function(d) { return "translate(" + x(d.xcoord) + "," + y(d.ycoord) + ")"; })
      .attr("d", d3.svg.symbol().type("square"))
      .style("fill", "#0277BD");

   shapes.append("path")
   	.filter(function(d) { return d.type == 2 })
   	  .attr("class", "shapes triangle")
      .attr("transform", function(d) { return "translate(" + x(d.xcoord) + "," + y(d.ycoord) + ")"; })
      .attr("d", d3.svg.symbol().type("triangle-up"))
      .style("fill", "#651FFF");
  // -------------------------


  // -------------------------
  // Add red line
  // -------------------------

    var line = d3.svg.line()
      .x(function(d) { return x(d.x);})
      .y(function(d) { return d.y;})
      .interpolate("linear");

    var lineData = [[{"x": 5435,"y": 0},{"x": 5435,"y":height}]]
    
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

  // Make translucent zoom area so user can zoom on entire chart
  var zoomarea = svg.append("rect")
        .attr("id"    , "zoomspace")
        .attr("style" , "opacity:0")
        .attr("width" , width)
        .attr("height", height)
        .call(zoom);

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
       .attr("transform", function(d) { return "translate(" + x(d.xcoord) + "," + y(d.ycoord) + ")"; });    

    dataPoints.selectAll('.line').attr("d", line)
	}       
}
// -------------------------
})();