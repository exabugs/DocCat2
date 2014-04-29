/**
 *
 */

"use strict";

var _ = require('underscore')
  , log = require('log')
  , should = require("should")
  , mongo = require('../lib/db')
  , async = require('async')
  ;

/**
 *
 * @param done
 */
exports.open = function (done) {
  mongo.open(function (err, db) {
    done(err, db);
  });
}

exports.remove = function (db, colls, done) {
  async.each(colls, function (coll, next) {
    db.collection(coll).remove({}, function (err) {
      next(err);
    });
  }, function (err) {
    done(err);
  });
}
