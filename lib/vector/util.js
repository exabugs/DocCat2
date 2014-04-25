/*
 * ベクトル操作(ユーティリティ)
 * @author exabugs@gmail.com
 */

"use strict";

var _ = require('underscore');

var util = {

  /**
   * ソート
   * @param array
   * @param attr
   * @returns {*}
   */
  sort: function (array, attr) {
    return _.sortBy(array, function (value) {
      return value[attr];
    });
  },

  /**
   * コサイン値(コサイン類似度)
   * @param array 共通項のペア配列
   *  [ //   a             b
   *    [ {attr: ...}, {attr: ...} ], // 軸 0
   *    [ {attr: ...}, {attr: ...} ], // 軸 1
   *    [ {attr: ...}, {attr: ...} ]  // 軸 2
   *  ]
   * @param attr 集計属性
   * @returns {number}
   */
  cosine: function (array, attr) {
    var sum_x = 0; // 内積
    var sum_a = 0; // ノルム
    var sum_b = 0; // ノルム
    array.forEach(function (value) {
      var a = value[0][attr];
      var b = value[1][attr];
      sum_x += a * b;
      sum_a += a * a;
      sum_b += b * b;
    });
    if (sum_a === 0 || sum_b === 0)
      return 0;
    return sum_x / Math.sqrt(sum_a) / Math.sqrt(sum_b);
  },

  /**
   * 共通集合
   * @param a 昇順ソート済み配列
   * @param b 昇順ソート済み配列
   * @param attr 比較属性
   * @returns {Array} 共通項のペア配列
   */
  intersect: function (a, b, attr) {
    var result = [];
    var head = 0;
    for (var i = 0; i < a.length && head < b.length; i++) {
      var value = a[i];
      var index = this.search(b, value, attr, head);
      if (0 <= index) {
        result.push([value, b[index]]);
        head = index + 1;
      } else if (-3 == index) {
        break;
      }
    }
    return result;
  },

  /**
   * バイナリサーチ
   * @param array 検索対象
   * @param value 検索値
   * @param attr 比較属性
   * @param head 開始インデックス
   * @returns
   *  0以上 : 見つかった
   *  -1   : 見つからない (範囲内)
   *  -2   : 見つからない (最小より小さい)
   *  -3   : 見つからない (最大より大きい)
   */
  search: function (array, value, attr, head) {
    head = head || 0;
    var tail = array.length - 1;
    while (head <= tail) {
      var where = head + Math.floor((tail - head) / 2);
      var a = array[where][attr];
      var b = value[attr];
      if (a == b)
        return where;
      if (a > b)
        tail = where - 1;
      else
        head = where + 1;
    }
    return tail == -1 ? -2 : array.length == head ? -3 : -1;
  }
}

module.exports = util;