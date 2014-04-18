/**
 * Created by dreamarts on 2014/03/30.
 */

var log = require('log')
  , should = require("should")
  , text = require('../../lib/text')
  ;

describe('text', function () {

  describe('parse', function () {
    it('should return -1 when the value is not present', function (done) {
      text.parse('食後にコーヒーを飲む', function (err, words) {
        words.should.eql({'食後': 1, 'コーヒー': 1});
        done();
      })
    })
  })

});
