var _ = require('underscore');
var Q = require('q');
var log = require('chip')();
var config = require("./config");
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
		var that = this;
		var deferred = Q.defer();

		this.sql("SELECT * FROM " + config.mysql.database + ".User WHERE username = " + db.escape(userdata.username))
			.then(function(rows, fields, returnValue) {
				log.info("Got "+rows[0].username);
				deferred.resolve(
					that.returnValue(
						returnValue,
						{
							data: rows
						}
					)
				);
			}).catch(function(returnValue) {
				deferred.reject(that.returnValue(returnValue, {
					http_status: 100,
					code: 100,
					text: "Unknown and mysterious error!"
				}));
			});

		return deferred.promise;
	};

	this.createUser = function(userdata) {
		var that = this;
		var deferred = Q.defer();

		this.sql(`
			INSERT INTO ${config.mysql.database}.User
			(
				email,
				username,
				password,
				image
			)
			VALUES (
				`+db.escape(userdata.email)+`,
				`+db.escape(userdata.username)+`,
				`+db.escape(userdata.password)+`,
				`+db.escape(userdata.image)+`
			);
		`).then(function(err, rows, fields, returnValue) {
			log.info("Apparent success in DB");
			log.info('DB Rows: ',rows);
			log.info('DB Fields: ',fields);
			deferred.resolve(that.returnValue(returnValue), {
				http_status: 201,
				leroyBrown: "bad"
			});
		}).catch(function(returnValue) {
			returnValue = that.returnValue(returnValue, {
				http_status: 400,
				text: "Some required data was omitted."
			});
			deferred.reject(returnValue);
		});

		return deferred.promise;
	};

	this.sql = function(query) {
		var that = this;
		return new Promise((resolve, reject) => {
			log.trace(query);
			db.query(query, function(err, rows, fields) {
				if (err) {
					log.error("DB Error: "+JSON.stringify(err));
					reject(that.returnValue({
						mysql_error: err
					}));
				}
				resolve(rows, fields);
			});
		});
	};

	this.returnValue = function() {
		var returnValue = {
			http_status: 200,
			text: "AOK"
		};
		Array.prototype.slice.call(arguments).map(function(override) {
			returnValue = _.extend(returnValue, override);
		});
		return returnValue;
	};

	this.destroy = function() {
		db.end();
	}

	this.construct();
};

module.exports = valhalla;
