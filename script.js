(function() {
vis = {}
vis.init = function(params) {
  // code for my init function ...
  vis.loaddata(params);
}
vis.loaddata = function(params) {
  // code for loading data ...
  vis.draw(params);
}
vis.draw = function(params) {
  console.log("Hello World");
}
})();