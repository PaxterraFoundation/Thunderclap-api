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

	this.getUser = function(req, res, username) {
		var that = this,
			deferred = Q.defer();

		this.sql("SELECT * FROM " + config.mysql.database + ".User WHERE username = " + db.escape(username))
			.then(function(rows, fields, returnValue) {
				var rows = rows[0];
				if (rows.length) {
					deferred.resolve(
						that.returnValue(
							returnValue,
							{
								data: rows
							}
						)
					);
				} else {
					log.warn("Could not find user "+username);
					deferred.reject(
						that.returnValue(
							{
								http_status: 404,
								text: "User '"+username+"' not found"
							}
						)
					);
				}
			}).catch(function(returnValue) {
				deferred.reject(
					that.returnValue(
						returnValue,
						{
							http_status: 100,
							text: "Generic Error"
						}
					)
				);
			});

		return deferred.promise;
	};

	this.createUser = function(req) {
		var that = this,
			userdata = {
				username: req.params.username,
				email: req.query.email,
				password: req.query.password,
				image: req.query.image
			},
			deferred = Q.defer();

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
			deferred.resolve(that.returnValue(returnValue, {
				http_status: 201
			}));
		}).catch(function(returnValue) {
			var rv = {
				http_status: 400,
				text: "Some required data was omitted."
			};
			switch (returnValue.mysql_error.code) {
				case "ER_DUP_ENTRY":
					rv.http_status = 409;
					rv.text = "User may already exist."
				break;
			}
			returnValue = that.returnValue(returnValue, rv);
			deferred.reject(returnValue);
		});

		return deferred.promise;
	};

	this.createGroup = function(req, res, groupname) {
		var that = this,
			deferred = Q.defer();

		this.sql(`
			INSERT INTO ${config.mysql.database}.Group
			(
				name
			)
			VALUES (
				`+db.escape(groupname)+`
			);
		`).then(function(result) {
			if (result[0].affectedRows === 1) {
				var insertId = result[0].insertId;
				log.info('Created Group entity, id: ' + insertId);
				that.associateGroupWithUser(req, res, insertId, api.session.user.id)
					.then(function(returnValue) {
						deferred.resolve(that.returnValue(returnValue));
					})
			} else {
				log.error('Group INSERT caused ' + result[0].affectedRows + ' affected rows');
			}
		}).catch(function(returnValue) {
			log.error('uh oh');
		});

		return deferred.promise;
	};

	this.associateGroupWithUser = function(req, res, groupId, userId) {
		var that = this,
			deferred = Q.defer();

		this.sql(`
			INSERT INTO ${config.mysql.database}.UserGroup
			(
				user_id,
				group_id
			)
			VALUES (
				`+db.escape(userId)+`,
				`+db.escape(groupId)+`
			)
		`).then(function(result) {
			if (result[0].affectedRows === 1) {
				var insertId = result[0].insertId;
				log.info('Associated Group '+groupId+' with User '+userId);
				deferred.resolve(that.returnValue());
			} else {
				log.error('UserGroup association INSERT caused ' + result[0].affectedRows + ' affected rows');
			}
		});

		return deferred.promise;
	};

	this.getGroupsUserIsIn = function(req, res, userId) {
		var that = this,
			deferred = Q.defer();

		this.sql(`
			SELECT
				g.*
			FROM
				${config.mysql.database}.User u,
				${config.mysql.database}.UserGroup ug,
				${config.mysql.database}.Group g
			WHERE
				u.id = ` + db.escape(userId) + `
				AND ug.user_id = u.id
				AND ug.group_id = g.id;
		`).then(function(rows, fields, returnValue) {
			if (rows.length) {
				log.info("Found "+rows.length+" groups associated with user "+userId);
				deferred.resolve(
					that.returnValue(
						returnValue,
						{
							data: rows[0]
						}
					)
				);
			} else {
				log.warn("Could not find user "+username);
				deferred.reject(
					that.returnValue(
						{
							http_status: 404,
							text: "User '"+username+"' not found"
						}
					)
				);
			}
		});

		return deferred.promise;
	};

	this.sql = function(query) {
		var that = this;
		log.trace("DB Query: " + query);
		return new Promise((resolve, reject) => {
			db.query(query, function(err) {
				if (err) {
					log.error("DB Error: "+JSON.stringify(err));
					reject(that.returnValue({
						mysql_error: err
					}));
				} else {
					resolve.call(undefined, Array.prototype.slice.call(arguments, 1));
				}
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
