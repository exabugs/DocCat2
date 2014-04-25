/**
 * Created by dreamarts on 2014/03/30.
 */

var _ = require('underscore')
  , log = require('log')
  , mongo = require('../../lib/db')
  , async = require('async')
  , should = require("should")
  , vector = require('../../lib/vector')
  ;

var TEST_COLLECTION = 'test_users';

describe('vector.index', function () {
  describe('ライブラリ', function () {


    it('cosine', function (done) {
      var tasks = [];
      tasks.push(function (next) {
        mongo.open(function(err, db) {
          next(err, db);
        });
      });
      tasks.push(function (db, next) {
        var collection = db.collection(TEST_COLLECTION);
        var data = [
          {
            user_id: 1,
            feature: [
              {key: 'a', val: '1'},
              {key: 'b', val: '1'},
              {key: 'c', val: '1'}
            ]
          },
          {
            user_id: 2

          }
        ];
        next();
      });
      async.waterfall(tasks, function (err, result) {
        done(err);
      });
    });
  });
});

