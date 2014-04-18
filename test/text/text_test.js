/**
 * Created by dreamarts on 2014/03/30.
 */

var log = require('log')
  , should = require("should")
  , text = require('../../lib/text')
  , mongo = require('../../lib/db')
  , async = require('async')

  ;

describe('text', function () {

  describe('parse', function () {
    it('should return -1 when the value is not present', function (done) {
      text.parse('食後にコーヒーを飲む', function (err, words) {
        words.should.eql({'食後': 1, 'コーヒー': 1});
        done();
      })
    })
  });

  describe('search', function () {
    it('should return -1 when the value is not present', function (done) {
      async.waterfall([
        function (next) {
          mongo.open(function (err, db) {
            next(err, db);
          });
        },
        function (db, next) {
          var collection = db.collection('mails.files');
          text.search(collection, {}, 'メールを削除', function (err, result) {
            next(err, db);
          })
        }
      ], function (err, db) {
        db.close();
        done(err);
      });
    })
  });

});
