var config = require("./config");
var log = require('chip')();
var osprey = require("osprey");
var app = require("express")();
var bodyParser = require("body-parser");
var Valhalla = require("./valhalla");
var api = {
	config: config,
	app: app,
	valhalla: undefined
};
api.valhalla = new Valhalla(api);
 
osprey
	.loadFile(api.config.raml)
	.then(function (middleware) {
		app.use("/v"+config.ver, middleware);
		// TODO errors should be in JSON format
		app.use(osprey.errorHandler(function (req, res, errors, stack) { /* Override */ }, 'en'));
		app.use(bodyParser.json());
		app.use(bodyParser.urlencoded({ extended: true }));

		api.routes = require("./routes/routes.js")(api);
		 
		api.server = app.listen(3000, function () {
		    console.log(api.config.name+" port %s", api.server.address().port);
		});
	})
	.catch(function(e) { console.error("Error: %s", e.message); });