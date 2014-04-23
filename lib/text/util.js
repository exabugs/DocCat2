"use strict";

var util = {

  getObjectEx: function (obj, key, callback) {
    var keys = key.split('.')
      , k = keys.pop();

    return callback(keys.reduce(function (obj, k) {
      if (obj[k] === undefined) obj[k] = {};
      return obj[k];
    }, obj), k);
  },

  /**
   * 取得
   * @param {Object} obj アクセスされるオブジェクト
   * @param {String} key アクセスするプロパティを表す文字列
   * @param {Any} [def=undefined] プロパティが存在しなかった場合の返り値
   * @return {Any} プロパティが存在した場合はその値を、無ければ<code>def</code>の値
   */
  getValueEx: function (obj, key, def) {
    return this.getObjectEx(obj, key, function(obj, key) {
      return (obj[key] === undefined) ? def : obj[key];
    });
  },

  /**
   * 設定
   * @param {Object} obj アクセスされるオブジェクト
   * @param {String} key アクセスするプロパティを表す文字列
   * @param {Any} val セットする値
   */
  setValueEx: function (obj, key, val) {
    /*
    var keys = key.split('.')
      , k = keys.pop()
      ;

    var object = this.getObjectEx(obj, keys);

    object[k] = val;
*/
    return this.getObjectEx(obj, key, function(object, k) {
      return object[k] = val;
    });
  },

  /**
   * 存在確認
   * @param {Object} obj アクセスされるオブジェクト
   * @param {String} key アクセスするプロパティを表す文字列
   * @return {Boolean} プロパティが存在するかどうか？
   */
  hasValueEx: function (obj, key) {
    var noobj = Object.create(null);
    var keys = key.split('.')
      , k = keys.pop()
      , hasObj = this.getValueEx(obj, keys.join('.'), noobj)
      ;

    return hasObj == noobj ? false : k in hasObj;
  },

  /**
   * 削除
   * @param {Object} obj アクセスされるオブジェクト
   * @param {String} key アクセスするプロパティを表す文字列
   * @return {Boolean} プロパティを削除できたか？（正確には違う）
   */
  delValueEx: function (obj, key) {
    var keys = key.split('.')
      , k = keys.pop()
      , delObj = this.getValueEx(obj, keys.join('.'));

    return delObj == null ? false : delete delObj[k];
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
   * @param a ソート済み配列
   * @param b ソート済み配列
   * @param attr 比較属性
   * @returns {Array} 共通項のペア配列
   */
  intersect: function (a, b, attr) {
    var result = [];
    var head = 0;
    for (var i = 0, len = a.length; i < len; i++) {
      var value = a[i];
      var index = this.search(b, value, attr, head);
      if (-1 != index) {
        result.push([value, b[index]]);
      }
      head = index + 1;
    }
    return result;
  },

  /**
   * バイナリサーチ
   * @param array 検索対象
   * @param value 検索値
   * @param attr 比較属性
   * @param head 開始インデックス
   * @returns {number}
   */
  search: function (array, value, attr, head) {
    head = head || 0;
    var tail = array.length - 1;
    while (head <= tail) {
      var where = head + Math.floor((tail - head) / 2);
      var c = this.compare(array[where][attr], value[attr]);
      if (0 == c)
        return where;
      if (0 < c)
        tail = where - 1;
      else
        head = where + 1;
    }
    return -1; // 探索失敗
  },

  /**
   * 比較関数
   * @param a
   * @param b
   * @returns {number}
   */
  compare: function (a, b) {
    return a == b ? 0 : a < b ? -1 : 1
  }
}

module.exports = util;
