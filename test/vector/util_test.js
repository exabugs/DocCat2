/**
 * Created by dreamarts on 2014/03/30.
 */

var _ = require('underscore')
  , log = require('log')
  , should = require("should")
  , vector = require('../../lib/vector')
  ;

describe('vector.util', function () {
  describe('ライブラリ', function () {

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

      var result = vector.util.sort(array, 'k');

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

      result = vector.util.search(array, {k: 0}, 'k');
      result.should.eql(-2);

      result = vector.util.search(array, {k: 1}, 'k');
      result.should.eql(-2);

      result = vector.util.search(array, {k: 2}, 'k');
      result.should.eql(0);

      result = vector.util.search(array, {k: 3}, 'k');
      result.should.eql(-1);

      result = vector.util.search(array, {k: 4}, 'k');
      result.should.eql(1);

      result = vector.util.search(array, {k: 5}, 'k');
      result.should.eql(-1);

      result = vector.util.search(array, {k: 6}, 'k');
      result.should.eql(2);

      result = vector.util.search(array, {k: 7}, 'k');
      result.should.eql(-3);

      result = vector.util.search(array, {k: 8}, 'k');
      result.should.eql(-3);

    });
  });

  describe('集合演算', function () {

    it('共通集合', function () {
      var array_a = [
        {k: 70},
        {k: 10},
        {k: 50},
        {k: 30},
        {k: 90},
        {k: 91},
        {k: 92}
      ];
      array_a = vector.util.sort(array_a, 'k');

      var array_b = [
        {k: 5},
        {k: 10},
        {k: 15},
        {k: 20},
        {k: 25},
        {k: 30},
        {k: 35}
      ];
      array_b = vector.util.sort(array_b, 'k');

      var result = vector.util.intersect(array_a, array_b, 'k');

      var expected = [
        [
          {k: 10},
          {k: 10}
        ],
        [
          {k: 30},
          {k: 30}
        ]
      ];
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
      array_a = vector.util.sort(array_a, 'k');

      var array_b = [
        {k: '10', v: -4}, //
        {k: '12', v: 2},
        {k: '15', v: 2},
        {k: '20', v: 2},
        {k: '30', v: -4}, //
        {k: '35', v: 2}
      ];
      array_b = vector.util.sort(array_b, 'k');

      var result = vector.util.intersect(array_a, array_b, 'k');

      var expected = [
        [
          {k: '10', v: 4}, // 3
          {k: '10', v: -4}
        ],
        [
          {k: '30', v: 4}, // 5
          {k: '30', v: -4}
        ]
      ];
      result.should.eql(expected);

      var norm_a = Math.sqrt((4 * 4) + (4 * 4));
      var norm_b = Math.sqrt((-4 * -4) + (-4 * -4));
      var norm_x = 4 * (-4) + 4 * (-4);
      expected = norm_x / norm_a / norm_b;

      var value = vector.util.cosine(result, 'v');
      value.should.eql(expected);
    });


  });


});

