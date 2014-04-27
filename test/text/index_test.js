/**
 * Created by dreamarts on 2014/03/30.
 */

var _ = require('underscore')
  , log = require('log')
  , should = require("should")
  , text = require('../../lib/text')
  , mongo = require('../../lib/db')
  , async = require('async')
  , frequency = require('../../lib/text/frequency')
  ;

describe('text.index', function () {

  describe('parse 1', function () {
    it('should return -1 when the value is not present', function (done) {
      text.parse('食後にコーヒーを飲む', function (err, words) {
        words.should.eql({'食後': 1, 'コーヒー': 1});
        done();
      })
    })
  });

  describe('search 2', function () {
    it('should return -1 when the value is not present', function (done) {
      async.waterfall([
        function (next) {
          mongo.open(function (err, db) {
            next(err, db);
          });
        },
        function (db, next) {
          var collection = db.collection('mails.files');
          frequency.object_frequency(collection, 'mails.df', function (err, result) {
            next(err, db);
          })
        },
        function (db, next) {
          var collection = db.collection('mails.files');
          var collection_freq = db.collection('mails.df');
          text.search(db, collection, collection_freq, {}, 'メールを削除', function (err, result) {
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
