var config = require("../config");
var log = require('chip')();

var appRouter = function(api) {
	var app = api.app,
		urlPrefix = "/v"+config.ver;

	var valhalla = function(method, req, res) {
		var promise = api.valhalla[method].apply(api.valhalla, Array.prototype.slice.call(arguments, 1));
		var after = function(returnValue) {
			try {
				res.status(returnValue.http_status).send(returnValue);
			} catch(e) {
				log.error('Error: ', e);
			}
		};
		promise.then(after, after);
	}

	app.use(urlPrefix, function(req, res, next) {
		log(req.route.stack[0].method.toUpperCase()+" "+req._parsedUrl.path);
		next();
	});

	app.get(urlPrefix+"/user/:username", function (req, res) {
		log("Getting "+req.params.username);
		return valhalla('getUser', req, res, req.params.username);
	});

	app.put(urlPrefix+"/user/:username", function (req, res) {
		log("Creating "+req.params.username);
		return valhalla('createUser', req, res);
	});

	app.put(urlPrefix+"/group/:groupname", function (req, res) {
		log("Creating group "+req.params.groupname, req.query);
		return valhalla('createGroup', req, res, req.params.groupname);
	});
}

module.exports = appRouter;