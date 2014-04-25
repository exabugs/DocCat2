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
   * ノルム
   * @param array
   * @param attr 集計属性
   * @returns {number}
   */
  norm: function (array, attr) {
    return Math.sqrt(_.reduce(array, function (sum, value) {
      var val = value[attr];
      return sum + val * val;
    }, 0));
  },

  /**
   * 内積
   * @param a 昇順ソート済み配列
   * @param b 昇順ソート済み配列
   * @param key_attr 属性
   * @param val_attr
   * @returns 内積
   */
  intersect: function (a, b, key_attr, val_attr) {
    var result = 0;
    var head = 0;
    for (var i = 0; i < a.length && head < b.length; i++) {
      var value = a[i];
      var index = this.search(b, value, key_attr, head);
      if (0 <= index) {
        result += value[val_attr] * b[index][val_attr];
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
