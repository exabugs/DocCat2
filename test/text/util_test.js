/**
 * Created by dreamarts on 2014/03/30.
 */

var _ = require('underscore')
  , log = require('log')
  , should = require("should")
  , text = require('../../lib/text')
  , mongo = require('../../lib/db')
  , async = require('async')
  ;

describe('util 2', function () {

  describe('集合演算', function () {

    it('共通集合', function (done) {
      var array_a = [
        {k: 70},
        {k: 10},
        {k: 50},
        {k: 30},
        {k: 90}
      ];
      array_a = _.sortBy(array_a, function (value) {
        return value.k;
      });
      var array_b = [
        {k: 5},
        {k: 10},
        {k: 15},
        {k: 20},
        {k: 25},
        {k: 30}
      ];
      var result = text.util.intersect(array_a, array_b, 'k');
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
      done();
    });

    it('共通集合', function (done) {
      var array_a = [
        {k: '70', v: 2},
        {k: '10', v: 4}, //
        {k: '50', v: 2},
        {k: '30', v: 4}, //
        {k: '90', v: 2}
      ];
      array_a = _.sortBy(array_a, function (value) {
        return value.k;
      });
      var array_b = [
        {k: '10', v: -4}, //
        {k: '12', v: 2},
        {k: '15', v: 2},
        {k: '20', v: 2},
        {k: '30', v: -4}, //
        {k: '35', v: 2}
      ];
      var result = text.util.intersect(array_a, array_b, 'k');
      var expected = [
        [
          {k: '10', v: 4},
          {k: '10', v: -4}
        ],
        [
          {k: '30', v: 4},
          {k: '30', v: -4}
        ]
      ];
      result.should.eql(expected);

      var norm_a = Math.sqrt((4 * 4) + (4 * 4));
      var norm_b = Math.sqrt((-4 * -4) + (-4 * -4));
      var norm_x = 4 * (-4) + 4 * (-4);
      expected = norm_x / norm_a / norm_b;

      var value = text.util.cosine(result, 'v');
      value.should.eql(expected);

      done();
    });


  });


});

