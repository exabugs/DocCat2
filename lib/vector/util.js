/*
 * ベクトル操作(ユーティリティ)
 * @author exabugs@gmail.com
 */

"use strict";

// 'util' は MongoDB の MapReduce に渡すので require 禁止
// Don't required here!

var _ = require('underscore');

/**
 * コンストラクタ
 * @param k
 * @param v
 * @constructor
 */
function Util(k, v) {
  this.k = k;
  this.v = v;
}

/**
 * ソート
 * @param array
 * @returns {*}
 */
Util.prototype.sort = function (array) {
  var k = this.k;
  return _.sortBy(array, function (value) {
    return value[k];
  });
}

/**
 * ノルム
 * @param array
 * @returns {number}
 */
Util.prototype.norm = function (array) {
  var sum = 0;
  for (var i = 0; i < array.length; i++) {
    var val = array[i][this.v];
    sum += val * val;
  }
  return Math.sqrt(sum);
}

/**
 * 正規化
 * @param array
 */
Util.prototype.normalize = function (array) {
  var norm = this.norm(array);
  for (var i = 0; i < array.length; i++) {
    array[i][this.v] = array[i][this.v] / norm;
  }
  return array;
}

/**
 * 併合
 * @param a 昇順ソート済み配列
 * @param b 昇順ソート済み配列
 * @returns {Array}
 */
Util.prototype.merge = function (a, b) {
  var result = [];
  var ia = 0, ib = 0;
  while (ia < a.length || ib < b.length) {
    if (ib == b.length) {
      result.push(this.copy(a[ia++]));
    } else if (ia == a.length) {
      result.push(this.copy(b[ib++]));
    } else {
      var ka = a[ia][this.k];
      var kb = b[ib][this.k];
      if (ka == kb) {
        var obja = this.copy(a[ia++])
        var objb = this.copy(b[ib++])
        obja[this.v] = obja[this.v] + objb[this.v];
        result.push(obja);
      } if (ka > kb) {
        result.push(this.copy(b[ib++]));
      } if (ka < kb) {
        result.push(this.copy(a[ia++]));
      }
    }
  }
  return result;
}

Util.prototype.copy = function (v) {
  return v;
  var result = {};
  for (var k in v) {
    result[k] = v[k];
  }
  return result;
}

/**
 * 内積
 * @param a 昇順ソート済み配列
 * @param b 昇順ソート済み配列
 * @returns {number}
 */
Util.prototype.intersect = function (a, b) {
  var result = 0;
  var head = 0;
  for (var i = 0; i < a.length && head < b.length; i++) {
    var value = a[i];
    var index = this.search(b, value, head);
    if (0 <= index) {
      result += value[this.v] * b[index][this.v];
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
 * @returns {number}
 */
Util.prototype.cosine = function (a, b) {
  var intersect = this.intersect(a, b);
  var norm_a = this.norm(a);
  var norm_b = this.norm(b);
  return intersect / norm_a / norm_b;
}

/**
 * バイナリサーチ
 * @param array 検索対象
 * @param value 検索値
 * @param head 開始インデックス
 * @returns {number}
 *  0以上 : 見つかった
 *  -1   : 見つからない (範囲内)
 *  -2   : 見つからない (最小より小さい)
 *  -3   : 見つからない (最大より大きい)
 */
Util.prototype.search = function (array, value, head) {
  head = head || 0;
  var tail = array.length - 1;
  while (head <= tail) {
    var where = head + Math.floor((tail - head) / 2);
    var a = array[where][this.k];
    var b = value[this.k];
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
