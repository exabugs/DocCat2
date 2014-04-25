/*
 * GET users listing.
 */

var _ = require('underscore')
  , mongodb = require('mongodb')
  , fs = require('fs')
  , async = require('async')
  , util = require('./util')
  , extend = require('../extend')
  ;

exports.util = util;

// https://github.com/mongodb/node-mongodb-native/pull/1165
var mr_util = {}
_.extend(mr_util, util);
_.extend(mr_util, extend);

exports.search = function (db, collection, collection_df, condition, keyword, map, callback) {

  var attr = 'metadata.tf';

  var tasks = [];

  tasks.push(function (done) {

    var words = _.pluck(keyword, 'k');
    if (0 < words.length) {
      condition[[attr, 'k'].join('.')] = {$in: words};
    }

    collection.mapReduce(
      function () {
        var array = util.getValue(this, attr);
        var result = util.intersect(keyword, array, 'k');
        emit(this._id, util.cosine(result, 'c'));
      },
      function (key, values) {
        return values[0];
      },
      {
        scope: {util: mr_util, keyword: keyword, attr: attr},
        query: condition,
        //out: out
        out: {inline: 1}
      },
      function (err, result) {
        return done(err, result);
      }
    );
  });
  async.waterfall(tasks, function (err, result) {
    callback(err, result);
  });
};
