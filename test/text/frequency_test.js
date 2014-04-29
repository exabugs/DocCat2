/**
 * Created by dreamarts on 2014/03/30.
 */

"use strict";

var _ = require('underscore')
  , log = require('log')
  , should = require("should")
  , text = require('../../lib/text')
  , mongo = require('../../lib/db')
  , async = require('async')
  , frequency = require('../../lib/text/frequency')
  , test = require('../test_util')
  ;

describe('text.frequency', function () {

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

  it('準備', function (done) {
    var collection = db.collection('test');
    var data = [
      {
        user_id: 1,
        tf: [
          {key: 'a', val: '2'},
          {key: 'b', val: '2'},
          {key: 'c', val: '2'}
        ]
      },
      {
        user_id: 2,
        tf: [
          {key: 'a', val: '1'},
          {key: 'b', val: '1'},
          {key: 'c', val: '1'},
          {key: 'd', val: '1'}
        ]
      }
    ];
    async.each(data, function (item, next) {
      collection.insert(item, function (err) {
        next(err);
      });
    }, function (err) {
      done(err);
    })
  });

  it('term_frequency', function (done) {
    var collection = db.collection('mails.files');
    var attribute = 'metadata.tf'
    var field = {k: 'k', v: 'c'};
    var option = {
      condition: {"metadata.origin.messageId": "EBEBFB71-96DD-4FF0-9787-49B4D8A684E4@dreamarts.co.jp"}
    };
    frequency.term_frequency(collection, attribute, field, option, function (err, result) {
      should.not.exist(err);
      done();
    });
  });
});
