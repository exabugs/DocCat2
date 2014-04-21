/**
 * Created by dreamarts on 2014/03/30.
 */

var log = require('log')
  , should = require("should")
  , R = require('../../lib/R')
  , mongo = require('../../lib/db')
  , async = require('async')

  ;

describe('R', function () {

  describe('exec', function () {
    it('should return -1 when the value is not present', function (done) {

      var script = 'lib/R/scripts/cmdscale.R';
      var args = ['test/R/data/car.csv', 'test/R/data/car_out.csv'];

      R.exec(script, args, function (err, result) {
        done();

      });


    })
  });

});
