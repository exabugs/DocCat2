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
  , test = require('../test_util')
  ;

describe('text.index', function () {

  var db;

  before(function (done) {
    // テストが始まる前の処理
    test.open(function (err, _db) {
      db = _db;
      done();
    });
  });

  after(function (done) {
    // テストが終わった後の処理
    db.close();
    done();
  });

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
          var collection = db.collection('mails.files');
          var attribute = 'metadata.tf';
          var field = ['k'];
          var option = {out: 'mails.df', condition: {}};
          frequency.object_frequency(collection, attribute, field, option, function (err, result) {
            next(err);
          })
        },
        function (next) {
          var collection = db.collection('mails.files');
          var collection_freq = db.collection('mails.df');
          text.search(db, collection, collection_freq, {}, 'メールを削除', function (err, result) {
            next(err);
          })
        }
      ], function (err) {
        done(err);
      });
    })
  });

});
