var log = require('chip')();

var appRouter = function(api) {
	var app = api.app,
		config = api.config,
		urlPrefix = "/v"+config.ver;

	var valhalla = function(method, req, res) {
		var promise = api.valhalla[method].apply(api.valhalla, Array.prototype.slice.call(arguments, 1));
		var after = function(returnValue) {
			try {
				sendResponse(res, returnValue);
			} catch(e) {
				log.error('Error: ', e);
			}
		};
		return promise.then(after, after);
	};

	var sendResponse = function(res, returnValue) {
		var http_status = returnValue.http_status;
		delete returnValue.http_status;
		return res.status(http_status).send(returnValue);
	};

	app.use(urlPrefix, function(req, res, next) {
		log(req.route.stack[0].method.toUpperCase()+" "+req._parsedUrl.path);
		var username = req.get('X-Paxterra-Username');
		if (username) {
			log.info('Username: '+username);
			api.valhalla.getUser(req, res, username)
				.then(function(returnValue) {
					api.session.user = {
						id: returnValue.data[0].id,
						username: username
					};
					log.info('User: '+JSON.stringify(api.session.user));
					next();
				}).catch(function(returnValue) {
					sendResponse(res, returnValue);
				})
		} else {
			log.warn('NO USERNAME!',req.headers);
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

	app.post(urlPrefix+"/nodes", function (req, res) {
		log("Creating Node "+req.query.nodedata);
		return valhalla('createNode', req, res, req.query.nodedata);
	});
}

module.exports = appRouter;