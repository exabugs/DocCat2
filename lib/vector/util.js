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

/**
 * extend
 *  case 1 : util.extend(object, master, array)
 *  case 2 : util.extend(object, master)
 *  case 3 : util.extend(master, array)
 *  case 4 : util.extend(master)
 * @param obj
 * @param master
 */
Util.prototype.extend = function (object, master, attrs) {

  if (attrs === undefined || attrs === null) {
    if (master === undefined || master === null) {
      // case 4 : util.extend(master);
      master = object;
      object = this;
    }
    if (master instanceof Array) {
      // case 3: util.extend(master, []);
      attrs = master;
      master = object;
      object = this;
    } else {
      // case 2 : util.extend(object, master);
      attrs = Object.keys(master);
    }
  }

  for (var i = 0; i < attrs.length; i++) {
    var x = attrs[i];
    object[x] = master[x];
  }
}

module.exports = Util;
