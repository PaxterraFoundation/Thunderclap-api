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
		if (req.query.username) {
			api.valhalla.getUser(req, res, req.query.username)
				.then(function(returnValue) {
					api.session.user = {
						id: returnValue.data[0].id,
						username: req.query.username
					};
					log.info('User: '+JSON.stringify(api.session.user));
					next();
				}).catch(function(returnValue) {
					res.status(returnValue.http_status).send(returnValue);
				})
		} else {
			next();
		}
	});

	app.get(urlPrefix+"/user/:username", function (req, res) {
		log("Getting "+req.params.username);
		return valhalla('getUser', req, res, req.params.username);
	});

	app.get(urlPrefix+"/user/:username/groups", function (req, res) {
		log("Getting groups for user "+req.params.username);
		return valhalla('getGroupsUserIsIn', req, res, api.session.user.id);
	});

	app.post(urlPrefix+"/user/:username", function (req, res) {
		log("Creating "+req.params.username);
		return valhalla('createUser', req, res);
	});

	app.post(urlPrefix+"/group/:groupname", function (req, res) {
		log("Creating group "+req.params.groupname, req.query);
		return valhalla('createGroup', req, res, req.params.groupname);
	});
}

module.exports = appRouter;