/*
 * Frequency Collection
 * @author exabugs@gmail.com
 */

var _ = require('underscore')
  , mongodb = require('mongodb')
  , async = require('async')
  , extend = require('../extend')
  , Util = require('../vector/util')
  ;

// https://github.com/mongodb/node-mongodb-native/pull/1165

/**
 *
 * @param keyword [{k:'会社', c:3},...] 形式
 * @param callback
 */
//function (keyword, callback)

// GET
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

// CREATE, UPDATE
/**
 * collection対象の出現頻度をもとめる
 * @param collection
 * @param attribute
 * @param field
 * @param option
 * @param callback
 */
exports.object_frequency = function (collection, attribute, field, option, callback) {

  // 検索条件
  var condition = option.condition || {};
  condition[attribute] = {$exists: 1};

  // ユーティリティ関数
  var util = {};
  extend.extend(util, extend);

  // パラメータ
  var params = {
    attribute: attribute, // String : 検索対象 key-val形式(配列) フィールド名
    field: field.k
  };

  // MapReduce
  collection.mapReduce(
    function () {
      _.getValue(this, $.attribute).forEach(function (item) {
        emit(item[$.field], 1);
      });
    },
    function (key, values) {
      return Array.sum(values);
    },
    {
      scope: {_: util, $: params},
      query: condition,
      out: option.out || {inline: 1}
    },
    function (err, results) {
      callback(err, results);
    }
  );
}

exports.countup = function (coll1, attr1, math1, coll2, attr2, math2, field, option, callback) {

  var condition1 = option.condition1 || {};

  var cursor = coll1.find(condition1);

  cursor.count(function (err, count) {
    if (count == 0) {
      return callback(err, count);
    }
    var c = count;
    cursor.each(function (err, item) {
      if (item) {


      }
    });
  });

}

exports.countup_one = function (collection, attribute, field, option, callback) {

  // 検索条件
  var condition = option.condition || {};
  condition[attribute] = {$exists: 1};

  // ユーティリティ関数
  var util = new Util(field.k, field.v);
  extend.extend(util, Util.prototype); // mapReduce関数scopeパラメータでprototypeが使えないのでコピー
  extend.extend(util, extend); // extendを使うのでコピー

  // パラメータ
  var params = {
    attribute: attribute, // String : 検索対象 key-val形式(配列) フィールド名
    field: field
  };

  collection.mapReduce(
    function () {
      _.getValue(this, $.attribute).forEach(function (item) {
        emit(item[$.field.k], item[$.field.v]);
      });
    },
    function (key, values) {
      return Array.sum(values);
    },
    {
      scope: {_: util, $: params},
      query: condition,
      out: option.out || {inline: 1}
    },
    function (err, results) {
      callback(err, results);
    }
  );
}