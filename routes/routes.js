var appRouter = function(api) {
	var app = api.app;

	app.put("/user/:username", function (req, res) {
		console.log('createUser');
		api.valhalla
			.createUser(req.params)
			.then(function(returnValue) {
				res.send(returnValue);
			});
	});
}

module.exports = appRouter;