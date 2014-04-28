/**
 * Created by dreamarts on 2014/03/30.
 */

var should = require('should')
  , log = require('log')
  , fs = require('fs')
  , async = require('async')
  , mail = require('../../lib/mail')
  , frequency = require('../../lib/text/frequency')
  , mongo = require("../../lib/db")
  ;

describe('mail', function () {

  function init_db(done) {
    mongo.open(function (err, db) {
      var colls = ['mails', 'mails.files', 'mails.chunks', 'mails.df'];
      async.each(colls, function (coll, next) {
        db.collection(coll).remove({}, function (err, reply) {
          next();
        });
      }, function (err) {
        done(err, db);
      });
    });
  }

  it('追加 1', function (done) {
    init_db(function (err, db) {
      var path = 'test/mail/data/test_1.eml';
      mail.add(path, function (err, mailInfo) {
        mail.get({"messageId": "1397023383.498516.1.1000481@moe.dreamarts.co.jp"}, function (err, result) {
          should.not.exist(err);
          result.length.should.eql(1);
          db.close();
          done();
        });
      });
    });
  });

  // 上記の「追加」がテストOKなので、ここではライブラリ的に使います。
  function add(array, callback) {
    async.each(array, function(item, next) {
      mail.add(item, function (err) {
        next(err);
      });
    }, function(err) {
      callback(err);
    });
  }

  it('追加 2', function (done) {
    init_db(function (err, db) {
      var data = [
        'test/mail/data/test_1.eml', // "1397023383.498516.1.1000481@moe.dreamarts.co.jp"
        'test/mail/data/test_2.eml'  // "EBEBFB71-96DD-4FF0-9787-49B4D8A684E4@dreamarts.co.jp"
        ];
      add(data, function (err) {
        mail.get({"messageId": "1397023383.498516.1.1000481@moe.dreamarts.co.jp"}, function (err, result) {
          should.not.exist(err);
          result.length.should.eql(1);
          done();
        });
      });
    });
  });

  it('追加 2', function (done) {
    init_db(function (err, db) {
      var data = [
        'test/mail/data/test_2.eml'  // "EBEBFB71-96DD-4FF0-9787-49B4D8A684E4@dreamarts.co.jp"
      ];
      add(data, function (err) {
        var collection = db.collection('mails.files');
        var attribute = 'metadata.tf'
        var field = {k: 'k', v: 'c'};
        var option = {
          condition: {"metadata.origin.messageId": "EBEBFB71-96DD-4FF0-9787-49B4D8A684E4@dreamarts.co.jp"}
        };
        frequency.countup_one(collection, attribute, field, option, function (err, result) {
          should.not.exist(err);
          done();
        });
      });
    });
  });

});


