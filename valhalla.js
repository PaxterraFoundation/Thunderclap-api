var _ = require('underscore');
var mysql = require('mysql');

var valhalla = function(api) {
	var app = api.app;
	var db = mysql.createConnection({
		host: api.config.mysql.host,
		user: api.config.mysql.user,
		password: api.config.mysql.password
	});

	this.construct = function() {
		db.connect();
	};

	this.getUser = function(userdata) {
		return this.sql(`
			SELECT * FROM User
			WHERE username = ${userdata.username};
		`);
	};

	this.createUser = function(userdata) {
		return this.sql(`
			INSERT INTO thunder.User
			(
				email,
				username,
				password,
				image
			)
			VALUES (
				'${userdata.email}',
				'${userdata.username}',
				'${userdata.password}',
				'${userdata.image}'
			);
		`);
	};

	this.sql = function(query) {
		var that = this;
		return new Promise((resolve, reject) => {
			db.query(query, function(err, rows, fields) {
				return resolve(that.returnValue());
			});
		});
	};

	this.returnValue = function(overrides) {
		return _.extend({
			code: 200,
			text: "AOK"
		}, overrides);
	};

	this.destroy = function() {
		db.end();
	}

	this.construct();
};

module.exports = valhalla;
