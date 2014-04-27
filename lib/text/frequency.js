/*
 * Frequency Collection
 * @author exabugs@gmail.com
 */

var _ = require('underscore')
  , mongodb = require('mongodb')
  , async = require('async')
  , extend = require('../extend')
  ;

// https://github.com/mongodb/node-mongodb-native/pull/1165



exports.frequency_map = function (collection, keyword, callback) {

  if (collection == null) {
    callback(null, null);
    return;
  }

  var words = _.pluck(keyword, 'k');
  var condition = {_id: {$in: words}};

  var map = null;
  collection.find(condition).toArray(function (err, items) {
    if (err) {
      callback(err, map);
    } else {
      map = _.reduce(items, function (memo, item) {
        memo[item._id] = item.value;
        return memo;
      }, {});
      callback(err, map);
    }
  });

}

exports.object_frequency = function (collection, out, callback) {

  var attribute = 'metadata.tf';

  var condition = {};
  condition[attribute] = {$exists: 1};

  var util = {};
  extend.extend(util, extend);

  // パラメータ
  var params = {
    attribute: attribute // String : 検索対象 key-val形式(配列) フィールド名
  };

  collection.mapReduce(
    function () {
      _.getValue(this, $.attribute).forEach(function(item) {
        emit(item['k'], 1);
      });
    },
    function (key, values) {
      return Array.sum(values);
    },
    {
      scope: {_: util, $: params},
      query: condition,
      out: out
    },
    function (err, results) {
      callback(err, results);
    }
  );
}
