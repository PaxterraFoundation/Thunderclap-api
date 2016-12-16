var config = require("../config");
var log = require('chip')();

var appRouter = function(api) {
	var app = api.app,
		urlPrefix = "/v"+config.ver;

	var valhalla = function(method, req, res, next) {
		var promise = api.valhalla[method](req.params);
		var after = function(returnValue) {
			res.status(returnValue.http_status).send(returnValue);
		};
		promise.then(after, after);
	}

	app.use(urlPrefix, function(req, res, next) {
		log(req.route.stack[0].method.toUpperCase()+" "+req._parsedUrl.path);
		next();
	});

	app.get(urlPrefix+"/user/:username", function (req, res) {
		log("Getting "+req.params.username);
		return valhalla('getUser', req, res);
	});

	app.put(urlPrefix+"/user/:username", function (req, res) {
		log("Creating "+req.params.username);
		return valhalla('createUser', req, res);
	});
}

module.exports = appRouter;