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

describe('index', function () {

  describe('ライブラリ', function () {

    it('準備', function (done) {
      var tasks = [];
      tasks.push(function (next) {
        mongo.open(function (err, db) {
          next(err, db);
        });
      });
      tasks.push(function (db, next) {
        var collection = db.collection(TEST_COLLECTION);
        collection.drop(function (err) {
          next(err, db, collection);
        });
      });
      tasks.push(function (db, collection, next) {
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
        async.each(data, function (item, next2) {
          collection.insert(item, function (err) {
            next2(err);
          });
        }, function (err) {
          next(err, db);
        })
      });
      async.waterfall(tasks, function (err, db) {
        db.close();
        done(err);
      });
    });

    it('cosine', function (done) {
      var tasks = [];
      tasks.push(function (next) {
        mongo.open(function (err, db) {
          next(err, db);
        });
      });
      tasks.push(function (db, next) {
        var collection = db.collection(TEST_COLLECTION);
        var attribute = 'tf';
        var field = {k: 'key', v: 'val'};
        var keyword = [
          {key: 'a', val: 1},
          {key: 'c', val: 1}
        ];
        var option = {
          condition: {user_id: 1},
          copy: ['user_id']
        }

        vector.cosine(collection, attribute, field, keyword, option, function (err, result) {
          next(err, db);
        });
      });
      async.waterfall(tasks, function (err, db) {
        db.close();
        done(err);
      });
    });

  });
});

