"use strict";

var util = {

  /**
   * obj[key] 取得
   * @param {Object} obj アクセスされるオブジェクト
   * @param {String} key アクセスするプロパティを表す文字列
   * @param {Any} [val=undefined] プロパティが存在しなかった場合の返り値
   * @return {Any} プロパティが存在した場合はその値を、無ければ<code>def</code>の値
   */
  getValueEx: function (obj, key, val) {
    return this.getObjectEx(obj, key, function (obj, key) {
      return (obj[key] === undefined) ? val : obj[key];
    });
  },

  /**
   * obj[key] 設定
   * @param {Object} obj アクセスされるオブジェクト
   * @param {String} key アクセスするプロパティを表す文字列
   * @param {Any} val セットする値
   */
  setValueEx: function (obj, key, val) {
    return this.getObjectEx(obj, key, function (obj, key) {
      return obj[key] = val;
    });
  },

  /**
   * obj[key] 確認
   * @param {Object} obj アクセスされるオブジェクト
   * @param {String} key アクセスするプロパティを表す文字列
   * @return {Boolean} プロパティが存在するかどうか？
   */
  hasValueEx: function (obj, key) {
    return this.getObjectEx(obj, key, function (obj, key) {
      return key in obj;
    });
  },

  /**
   * obj[key] 削除
   * @param {Object} obj アクセスされるオブジェクト
   * @param {String} key アクセスするプロパティを表す文字列
   * @return {Boolean} プロパティを削除できたか？（正確には違う）
   */
  delValueEx: function (obj, key) {
    return this.getObjectEx(obj, key, function (obj, key) {
      return delete obj[key];
    });
  },

  /**
   * obj[key]にアクセスできるように
   * @private
   * @param obj
   * @param key
   * @param callback
   * @returns {*}
   */
  getObjectEx: function (obj, key, callback) {
    var keys = key.split('.');
    var k = keys.pop();
    return callback(keys.reduce(function (obj, key) {
      if (obj[key] === undefined) obj[key] = {};
      return obj[key];
    }, obj), k);
  }

}

module.exports = util;
