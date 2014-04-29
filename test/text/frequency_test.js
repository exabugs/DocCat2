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
  var COLL = 'test';
  var COLL_OF = 'test.of';

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
    var collection = db.collection(COLL);
    test.remove(db, [COLL], function () {
      var data = [
        {
          user_id: 1,
          parent: 9,
          tf: [
            {key: 'a', val: 1},
            {key: 'b', val: 1},
            {key: 'c', val: 1}
          ]
        },
        {
          user_id: 2,
          parent: 9,
          tf: [
            {key: 'a', val: 1},
            {key: 'b', val: 1}
          ]
        },
        {
          user_id: 3,
          parent: 9,
          tf: [
            {key: 'a', val: 1}
          ]
        },
        {
          user_id: 3,
          parent: 8,
          tf: [
            {key: 'a', val: 1},
            {key: 'b', val: 1},
            {key: 'c', val: 1}
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
  });

  it('term_frequency', function (done) {
    var collection = db.collection(COLL);
    var attribute = 'tf'
    var field = ['key', 'val'];
    var option = {
      condition: {parent: 9}
    };
    frequency.term_frequency(collection, attribute, field, option, function (err, result) {
      should.not.exist(err);
      var expected = [
        {_id: 'a', value: 3},
        {_id: 'b', value: 2},
        {_id: 'c', value: 1}
      ];
      result.should.eql(expected);
      done();
    });
  });

  it('object_frequency', function (done) {
    var collection = db.collection(COLL);
    var attribute = 'tf'
    var field = ['key', 'val'];
    var option = {
      condition: {parent: 9}
    };
    frequency.object_frequency(collection, attribute, field, option, function (err, result) {
      should.not.exist(err);
      var expected = [
        {_id: 'a', value: 0},
        {_id: 'b', value: 0.4054651081081644},
        {_id: 'c', value: 1.0986122886681098}
      ];
      result.should.eql(expected);
      done();
    });
  });

  it('tfiof', function (done) {


    var collection = db.collection(COLL);
    var attribute = 'tf'
    var field = ['key', 'val', 'tfiof'];
    var option = {
      condition: {parent: 9},
      out: COLL_OF
    };
    frequency.object_frequency(collection, attribute, field, option, function (err, of_coll) {

      frequency.tfiof(collection, attribute, field, of_coll, option, function (err, result) {
        should.not.exist(err);
        done();
      });
    });

  });

});
