/*
 * ベクトル操作(ユーティリティ)
 * @author exabugs@gmail.com
 */

"use strict";

// 'util' は MongoDB の MapReduce に渡すので require 禁止
// Don't required here!

var _ = require('underscore');

function Util() {
}

/**
 * ソート
 * @param array
 * @param attr
 * @returns {*}
 */
Util.prototype.sort = function (array, attr) {
  return _.sortBy(array, function (value) {
    return value[attr];
  });
}

/**
 * ノルム
 * @param array
 * @param attr 集計属性
 * @returns {number}
 */
Util.prototype.norm = function (array, attr) {
  var sum = 0;
  for (var i = 0; i < array.length; i++) {
    var val = array[i][attr];
    sum += val * val;
  }
  return Math.sqrt(sum);
}

/**
 * 内積
 * @param a 昇順ソート済み配列
 * @param b 昇順ソート済み配列
 * @param key_attr 属性
 * @param val_attr
 * @returns 内積
 */
Util.prototype.intersect = function (a, b, key_attr, val_attr) {
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
}

/**
 * コサイン値(コサイン類似度)
 * @param a
 * @param b
 * @param key_attr
 * @param val_attr
 * @returns {number}
 */
Util.prototype.cosine = function (a, b, key_attr, val_attr) {
  var intersect = this.intersect(a, b, key_attr, val_attr);
  var norm_a = this.norm(a, val_attr);
  var norm_b = this.norm(b, val_attr);
  return intersect / norm_a / norm_b;
}

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
Util.prototype.search = function (array, value, attr, head) {
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

module.exports = Util;
