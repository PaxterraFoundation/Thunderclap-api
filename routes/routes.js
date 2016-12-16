var log = require('chip')();

var appRouter = function(api) {
	var app = api.app,
		config = api.config,
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
		return promise.then(after, after);
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

	app.get(urlPrefix+"/users", function (req, res) {
		log("Getting "+api.session.user.username);
		return valhalla('getUser', req, res, api.session.user.username);
	});

	app.get(urlPrefix+"/users/groups", function (req, res) {
		log("Getting groups for user "+api.session.user.username);
		return valhalla('getGroupsUserIsIn', req, res, api.session.user.id);
	});

	app.post(urlPrefix+"/users", function (req, res) {
		log("Creating "+req.query.username);
		return valhalla('createUser', req, res);
	});

	app.post(urlPrefix+"/groups", function (req, res) {
		log("Creating group "+req.query.groupname, req.query);
		return valhalla('createGroup', req, res, req.query.groupname);
	});
}

module.exports = appRouter;