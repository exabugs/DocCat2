/**
 * Created by dreamarts on 2014/03/30.
 */

var _ = require('underscore')
  , log = require('log')
  , should = require("should")
  , Util = require('../../lib/vector/util')
  ;

describe('util', function () {

  var util = new Util('k', 'v');

  describe('ライブラリ', function () {

    it('extend', function () {

      var util = new Util();
      var object;
      var result;

      var master = {
        test_function_a: function(a) {
          return a + 1;
        },
        test_function_b: function(a) {
          return a + 2;
        }
      }
      // case 1 : 別オブジェクトに、指定した属性をコピーする場合
      object = {};
      util.extend(object, master, ['test_function_b']);
      result = typeof object.test_function_a;
      result.should.eql('undefined');
      result = object.test_function_b(100);
      result.should.eql(102);

      // case 2 : 別オブジェクトに、全ての属性をコピーする場合
      object = {};
      util.extend(object, master);
      result = object.test_function_a(100);
      result.should.eql(101);
      result = object.test_function_b(100);
      result.should.eql(102);

      // case 3 : 自分自身に、指定した属性をコピーする場合
      util.extend(master, ['test_function_b']);
      result = typeof util.test_function_a;
      result.should.eql('undefined');
      result = util.test_function_b(100);
      result.should.eql(102);

      // case 4 : 自分自身に、全ての属性をコピーする場合
      util.extend(master);
      result = util.test_function_a(100);
      result.should.eql(101);
      result = util.test_function_b(100);
      result.should.eql(102);

    });

      /**
     * ノルム
     * @param array
     * @param attr
     * @returns {*}
     */
    it('ノルム', function () {
      var array = [
        {v: 6},
        {v: 4},
        {v: 2}
      ];

      var result = util.norm(array);

      var expected = Math.sqrt(6 * 6 + 4 * 4 + 2 * 2)

      result.should.eql(expected);
    });

    /**
     * ソート
     * @param array
     * @param attr
     * @returns {*}
     */
    it('ソート', function () {
      var array = [
        {k: 6},
        {k: 4},
        {k: 2}
      ];

      var result = util.sort(array);

      var expected = [
        {k: 2},
        {k: 4},
        {k: 6}
      ];

      result.should.eql(expected);
    });

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
    it('バイナリサーチ', function () {
      var array = [
        {k: 2},
        {k: 4},
        {k: 6}
      ];
      var result;

      result = util.search(array, {k: 0});
      result.should.eql(-2);

      result = util.search(array, {k: 1});
      result.should.eql(-2);

      result = util.search(array, {k: 2});
      result.should.eql(0);

      result = util.search(array, {k: 3});
      result.should.eql(-1);

      result = util.search(array, {k: 4});
      result.should.eql(1);

      result = util.search(array, {k: 5});
      result.should.eql(-1);

      result = util.search(array, {k: 6});
      result.should.eql(2);

      result = util.search(array, {k: 7});
      result.should.eql(-3);

      result = util.search(array, {k: 8});
      result.should.eql(-3);

    });
  });

  describe('集合演算', function () {

    it('内積', function () {
      var util = new Util('k', 'k');

      var array_a = [
        {k: 70},
        {k: 10},
        {k: 50},
        {k: 30},
        {k: 90},
        {k: 91},
        {k: 92}
      ];
      array_a = util.sort(array_a);

      var array_b = [
        {k: 5},
        {k: 10},
        {k: 15},
        {k: 20},
        {k: 25},
        {k: 30},
        {k: 35}
      ];
      array_b = util.sort(array_b);

      var result = util.intersect(array_a, array_b);

      var expected = 10 * 10 + 30 * 30;

      result.should.eql(expected);
    });

    it('コサイン類似度', function () {
      var array_a = [
        {k: '70', v: 2},
        {k: '10', v: 4}, //
        {k: '50', v: 2},
        {k: '30', v: 4}, //
        {k: '90', v: 2}
      ];
      array_a = util.sort(array_a);

      var array_b = [
        {k: '10', v: -4}, //
        {k: '12', v: 2},
        {k: '15', v: 2},
        {k: '20', v: 2},
        {k: '30', v: -4}, //
        {k: '35', v: 2}
      ];
      array_b = util.sort(array_b);

      var result = util.intersect(array_a, array_b);

      var expected = 4 * (-4) + 4 * (-4);


      result.should.eql(expected);


      var norm_a = Math.sqrt((4 * 4) * 2+ (2 * 2) * 3);
      var norm_b = Math.sqrt((-4 * -4) * 2 + (2 * 2) * 4);
      var norm_x = 4 * (-4) + 4 * (-4);
      expected = norm_x / norm_a / norm_b;

      var value = util.cosine(array_a, array_b);
      value.should.eql(expected);
    });


  });


});

