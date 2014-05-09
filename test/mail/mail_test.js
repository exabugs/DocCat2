/**
 * Created by dreamarts on 2014/03/30.
 */

var should = require('should')
  , log = require('log')
  , fs = require('fs')
  , async = require('async')
  , mail = require('../../lib/mail')
  , mongo = require('../../lib/db')
  , test = require('../test_util')
  , Searcher = require('node-searcher')
  ;

var COLLS = ['mails', 'mails.files', 'mails.chunks', 'mails.df'];

var FIELD = ['k', 'c', 'w'];

var FREQ = {'tf': 'mails.of'};

describe('mail', function () {

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

  it('追加 1', function (done) {
    test.remove(db, COLLS, function (err) {
      var path = 'test/mail/data/test_1.eml';
      mail.add(path, function (err, mailInfo) {
        mail.get({'messageId': '1397023383.498516.1.1000481@moe.dreamarts.co.jp'}, function (err, result) {
          should.not.exist(err);
          result.length.should.eql(1);
          done();
        });
      });
    });
  });

  // 上記の「追加」がテストOKなので、ここではライブラリ的に使います。
  function add(array, callback) {
    async.each(array, function (item, next) {
      mail.add(item, function (err) {
        next(err);
      });
    }, function (err) {
      callback(err);
    });
  }

  it('追加 2', function (done) {
    test.remove(db, COLLS, function (err) {
      var data = [
        'test/mail/data/test_1.eml', // '1397023383.498516.1.1000481@moe.dreamarts.co.jp'
        'test/mail/data/test_2.eml'  // 'EBEBFB71-96DD-4FF0-9787-49B4D8A684E4@dreamarts.co.jp'
      ];
      add(data, function (err) {
        mail.get({'messageId': '1397023383.498516.1.1000481@moe.dreamarts.co.jp'}, function (err, result) {
          should.not.exist(err);
          result.length.should.eql(1);
          done();
        });
      });
    });
  });

  it('Index作成', function (done) {

    var target = {
      collection: 'mails',
      attribute: 'tf',
      option: {
        condition: {}
      }
    };

    var source = {
      collection: 'mails.files',
      attribute: 'metadata.tf',
      key: 'metadata.parent',
      option: {
        condition: {}
      }
    };

    var searcher = new Searcher(mongo.url(), FIELD, FREQ);

    searcher.indexing(target, source, function (err) {
      done();
    });

  });

  it('検索実行', function (done) {

    var target = {
      collection: 'mails',
      option: {
        condition: {
          'tf': '先日フジテレビでラーメン'
        },
        copy: ['subject'],
        out: 'mails.search.result'
      }
    };

    var searcher = new Searcher(mongo.url(), FIELD, FREQ);

    searcher.search(target, function (err) {
      done();
    });

  });

});


