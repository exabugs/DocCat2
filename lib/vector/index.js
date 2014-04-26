/*
 * ベクトル操作
 * @author exabugs@gmail.com
 */

"use strict";

var _ = require('underscore')
  , Util = require('./util')
  , extend = require('../extend')
  ;

/**
 * コサイン値(類似度)
 * @param collection Collection : 検索対象コレクション
 * @param condition  Map : 検索条件
 * @param attribute     String : 検索対象 key-val形式(配列) フィールド名
 * @param keyword    配列 : 検索キーワード key-val形式(配列)
 * @param out        (String|{inline: 1}) 出力形式
 * @param callback
 * option = {
  condition,
  out
}
 */

//exports.cosine = function (collection, condition, target, field, keyword, out, callback) {
exports.cosine = function (collection, attribute, field, keyword, option, callback) {

  // key-val形式 [{k:'仕事', c:1}, {k:'残業', c:2}] (keyで昇順にソート済みのこと)

  // 検索条件
  var condition = option.condition || {};
  var words = _.pluck(keyword, field.k);
  if (0 < words.length) {
    condition[[attribute, field.k].join('.')] = {$in: words};
  }

  // ユーティリティ関数
  var util = new Util(field.k, field.v);
  extend.extend(util, Util.prototype); // mapReduce関数scopeパラメータでprototypeが使えないのでコピー
  extend.extend(util, extend); // extendを使うのでコピー

  // パラメータ
  var params = {
    keyword: keyword, // 配列 : 検索キーワード key-val形式(配列)
    attribute: attribute, // String : 検索対象 key-val形式(配列) フィールド名
    copy: option.copy
  }

  collection.mapReduce(
    function () {
      var array = util.getValue(this, params.attribute);

      // keywordとarrayの内積(正規化されているなら、これがコサイン値(類似度))
      //var intersect = util.intersect(params.keyword, array);

      // コサイン値(類似度)を求める
      var cosine = util.cosine(params.keyword, array);

      // 出力
      var value = {};
      util.extend(value, this, params.copy);
      util.extend(value, {_score: cosine});

      emit(this._id, value);
    },
    function (key, values) {
      return values[0];
    },
    {
      scope: {util: util, params: params},
      query: condition,
      out: option.out || {inline: 1}
    },
    function (err, result) {
      return callback(err, result);
    }
  );

};
