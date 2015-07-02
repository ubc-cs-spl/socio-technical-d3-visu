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

  y = d3.scale.linear()
    .range([height, 0]).domain([0,ymax]);

  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickSize(-height);

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickSize(-width);

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0, "+ height +")")
    .call(xAxis);
 
  svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);
  // -------------------------

  // -------------------------
  // Add datapoints
  // -------------------------
  var dataPoints = svg.append("g")
  		.attr("id", "dataPointsGroup")
  		.attr("clip-path", "url(#mainclip)");

  dataPoints.selectAll("circle")
   	.data(params.data)
   .enter()
    .append("circle")
    .attr("class", "circle")
    .attr("cx", function (d) { return x(d.xcoord); })
    .attr("cy", function (d) { return y(d.ycoord); })
    .attr("r", function (d)  { return 5; });
  // -------------------------
  

  // -------------------------
  // Add zoom
  // -------------------------
  var zoom = d3.behavior.zoom()
      .x(x).y(y)
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
	  dataPoints.selectAll("circle")
	  	.attr("cx", function (d) { return x(d.xcoord); })

	}       
}
// -------------------------
})();