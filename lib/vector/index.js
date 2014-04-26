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
 * @param target     String : 検索対象 key-val形式(配列) フィールド名
 * @param keyword    配列 : 検索キーワード key-val形式(配列)
 * @param weight     Map : 軸の重み付け {'仕事':0.3, '残業':0.4}
 * @param out        (String|{inline: 1}) 出力形式
 * @param callback
 */
exports.cosine = function (collection, condition, target, field, keyword, weight, out, callback) {

  // key-val形式 [{k:'仕事', c:1}, {k:'残業', c:2}] (keyで昇順にソート済みのこと)

  var words = _.pluck(keyword, field.k);
  if (0 < words.length) {
    condition[[target, field.k].join('.')] = {$in: words};
  }

  var util = new Util(field.k, field.v);
  util.extend(Util.prototype); // mapReduce関数scopeパラメータはprototypeは使えないのでコピー
  util.extend(extend); // extendを使うのでコピー

  var params = {
    keyword: keyword, // 配列 : 検索キーワード key-val形式(配列)
    weight: weight, // Map : 軸の重み付け [{k:'仕事', c:0.3}, {k:'残業', c:0.4}] (IDFの値)
    target: target // String : 検索対象 key-val形式(配列) フィールド名
  }

  collection.mapReduce(
    function () {
      var array = util.getValue(this, params.target);

      // keywordとarrayの内積(正規化されているなら、これがコサイン値(類似度))
      var intersect = util.intersect(params.keyword, array);

      // コサイン値(類似度)を求める
      var cosine = util.cosine(params.keyword, array);

      emit(this._id, {array:array, cosine:cosine});
    },
    function (key, values) {
      return values[0];
    },
    {
      scope: {util: util, params: params},
      query: condition,
      out: out
    },
    function (err, result) {
      return callback(err, result);
    }
  );

};
