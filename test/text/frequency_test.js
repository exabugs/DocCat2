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
  var COLL_FILES = 'test.files'
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

  var DATA_COLL_FILES = [
    {
      _id: 1,
      parents: [9],
      tf: [
        {key: 'a', val: 1},
        {key: 'b', val: 1},
        {key: 'c', val: 1}
      ]
    },
    {
      _id: 2,
      parents: [9],
      tf: [
        {key: 'a', val: 1},
        {key: 'b', val: 1}
      ]
    },
    {
      _id: 3,
      parents: [9],
      tf: [
        {key: 'a', val: 1}
      ]
    },
    {
      _id: 4,
      parents: [8],
      tf: [
        {key: 'x', val: 1},
        {key: 'y', val: 1},
        {key: 'z', val: 1}
      ]
    },
    {
      _id: 5,
      parents: [8],
      tf: [
        {key: 'x', val: 1},
        {key: 'y', val: 1},
        {key: 'z', val: 1}
      ]
    },
    {
      _id: 6,
      parents: [8],
      tf: [
        {key: 'x', val: 1},
        {key: 'y', val: 1},
        {key: 'z', val: 1}
      ]
    },
    {
      _id: 7,
      parents: [7],
      tf: [
        {key: 'x', val: 1},
        {key: 'y', val: 1}
      ]
    },
    {
      _id: 8,
      parents: [7],
      tf: [
        {key: 'x', val: 1}
      ]
    }
  ];

  it('準備', function (done) {
    test.remove(db, [COLL_FILES], function () {
      var collection = db.collection(COLL_FILES);
      test.insert(db, collection, DATA_COLL_FILES, function (err) {
        done();
      });
    });
  });

  var DATA_COLL = [
    {
      _id: 7
    },
    {
      _id: 8
    },
    {
      _id: 9
    }
  ];

  it('準備', function (done) {
    test.remove(db, [COLL], function () {
      var collection = db.collection(COLL);
      test.insert(db, collection, DATA_COLL, function (err) {
        done();
      });
    });
  });

  it('term_frequency', function (done) {
    var collection = db.collection(COLL_FILES);
    var attribute = 'tf'
    var field = ['key', 'val'];
    var option = {
      condition: {parents: 9}
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
    var collection = db.collection(COLL_FILES);
    var attribute = 'tf'
    var field = ['key', 'val'];
    var option = {
      condition: {parents: 9}
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

  it('coutup', function (done) {


    var master_collection = db.collection(COLL);
    var master_option = {
      attribute: 'meta.tf'
    };
    var match = 'parents'
    var collection = db.collection(COLL_FILES);
    var attribute = 'tf'
    var field = ['key', 'val'];
    var option = {};
    frequency.countup(master_collection, master_option, match, collection, attribute, field, option, function (err) {

      should.not.exist(err);
      done();
    });

  });

  it('tfiof', function (done) {


    var collection = db.collection(COLL);
    var attribute = 'meta.tf'
    var field = ['key', 'val', 'tfiof'];
    var option = {
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
