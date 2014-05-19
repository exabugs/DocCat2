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
        mail.get({'messageId': 'C_M_M_I_D.21_1_22723_0_0.1368720.1398293111@cmt5t.nikkei.co.jp'}, function (err, result) {
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
        'test/mail/data/test_1.eml', // 'C_M_M_I_D.21_1_22723_0_0.1368720.1398293111@cmt5t.nikkei.co.jp'
//        'test/mail/data/test_1.eml', // 'C_M_M_I_D.21_1_22723_0_0.1368720.1398293111@cmt5t.nikkei.co.jp'
//        'test/mail/data/test_1.eml', // 'C_M_M_I_D.21_1_22723_0_0.1368720.1398293111@cmt5t.nikkei.co.jp'
        'test/mail/data/test_2.eml', // 'C_M_M_I_D.21_1_22661_0_32605.1366866.1398050562@cmt5t.nikkei.co.jp'
//        'test/mail/data/test_2.eml', // 'C_M_M_I_D.21_1_22661_0_32605.1366866.1398050562@cmt5t.nikkei.co.jp'
//        'test/mail/data/test_2.eml', // 'C_M_M_I_D.21_1_22661_0_32605.1366866.1398050562@cmt5t.nikkei.co.jp'
        'test/mail/data/test_3.eml',  // 'C_M_M_I_D.21_1_22551_0_0.1364559.1397640241@cmt5t.nikkei.co.jp'
//        'test/mail/data/test_3.eml',  // 'C_M_M_I_D.21_1_22551_0_0.1364559.1397640241@cmt5t.nikkei.co.jp'
//        'test/mail/data/test_3.eml',  // 'C_M_M_I_D.21_1_22551_0_0.1364559.1397640241@cmt5t.nikkei.co.jp'
        'test/mail/data/test_4.eml',  // 'C_M_M_I_D.21_1_22551_0_0.1364559.1397640241@cmt5t.nikkei.co.jp'
        'test/mail/data/test_5.eml',  // 'C_M_M_I_D.21_1_22551_0_0.1364559.1397640241@cmt5t.nikkei.co.jp'
        'test/mail/data/test_6.eml',  // 'C_M_M_I_D.21_1_22551_0_0.1364559.1397640241@cmt5t.nikkei.co.jp'
        'test/mail/data/test_7.eml',  // 'C_M_M_I_D.21_1_22551_0_0.1364559.1397640241@cmt5t.nikkei.co.jp'
        'test/mail/data/test_8.eml',  // 'C_M_M_I_D.21_1_22551_0_0.1364559.1397640241@cmt5t.nikkei.co.jp'
        'test/mail/data/test_9.eml',  // 'C_M_M_I_D.21_1_22551_0_0.1364559.1397640241@cmt5t.nikkei.co.jp'
        'test/mail/data/test_a.eml',  // 'C_M_M_I_D.21_1_22551_0_0.1364559.1397640241@cmt5t.nikkei.co.jp'
        'test/mail/data/test_b.eml',  // 'C_M_M_I_D.21_1_22551_0_0.1364559.1397640241@cmt5t.nikkei.co.jp'
        'test/mail/data/test_c.eml',  // 'C_M_M_I_D.21_1_22551_0_0.1364559.1397640241@cmt5t.nikkei.co.jp'
        'test/mail/data/test_d.eml',  // 'C_M_M_I_D.21_1_22551_0_0.1364559.1397640241@cmt5t.nikkei.co.jp'
        'test/mail/data/test_e.eml',   // 'C_M_M_I_D.21_1_22551_0_0.1364559.1397640241@cmt5t.nikkei.co.jp'
        'test/mail/data/test_f.eml',   // 'C_M_M_I_D.21_1_22551_0_0.1364559.1397640241@cmt5t.nikkei.co.jp'
        'test/mail/data/test_g.eml',   // 'C_M_M_I_D.21_1_22551_0_0.1364559.1397640241@cmt5t.nikkei.co.jp'
        'test/mail/data/test_h.eml',   // 'C_M_M_I_D.21_1_22551_0_0.1364559.1397640241@cmt5t.nikkei.co.jp'
        'test/mail/data/test_i.eml',   // 'C_M_M_I_D.21_1_22551_0_0.1364559.1397640241@cmt5t.nikkei.co.jp'
        'test/mail/data/test_j.eml',   // 'C_M_M_I_D.21_1_22551_0_0.1364559.1397640241@cmt5t.nikkei.co.jp'
        'test/mail/data/test_k.eml',   // 'C_M_M_I_D.21_1_22551_0_0.1364559.1397640241@cmt5t.nikkei.co.jp'
        'test/mail/data/test_l.eml',   // 'C_M_M_I_D.21_1_22551_0_0.1364559.1397640241@cmt5t.nikkei.co.jp'
        'test/mail/data/test_m.eml',   // 'C_M_M_I_D.21_1_22551_0_0.1364559.1397640241@cmt5t.nikkei.co.jp'
        'test/mail/data/test_n.eml',   // 'C_M_M_I_D.21_1_22551_0_0.1364559.1397640241@cmt5t.nikkei.co.jp'
        'test/mail/data/test_o.eml',   // 'C_M_M_I_D.21_1_22551_0_0.1364559.1397640241@cmt5t.nikkei.co.jp'
        'test/mail/data/test_p.eml',   // 'C_M_M_I_D.21_1_22551_0_0.1364559.1397640241@cmt5t.nikkei.co.jp'
        'test/mail/data/test_q.eml',   // 'C_M_M_I_D.21_1_22551_0_0.1364559.1397640241@cmt5t.nikkei.co.jp'
        'test/mail/data/test_r.eml',   // 'C_M_M_I_D.21_1_22551_0_0.1364559.1397640241@cmt5t.nikkei.co.jp'
        'test/mail/data/test_s.eml'   // 'C_M_M_I_D.21_1_22551_0_0.1364559.1397640241@cmt5t.nikkei.co.jp'
      ];
      add(data, function (err) {
        mail.get({'messageId': 'C_M_M_I_D.21_1_22723_0_0.1368720.1398293111@cmt5t.nikkei.co.jp'}, function (err, result) {
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

  it('相互類似度', function (done) {

    var target = {
      collection: 'mails',
      attribute: 'tf',
      option: {
        out: 'mails.mutual'
      }
    };

    var searcher = new Searcher(mongo.url(), FIELD, FREQ);

    searcher.mutualize(target, function (err) {
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

    var data = [];
    for (var i = 0; i < 1; i++) {
      data.push(i);
    }
    async.eachLimit(data, 30, function (item, next) {
      searcher.search(target, function (err) {
        if (err) {
          console.log(err);
        }
        next(err);
      });
    }, function (err) {
      done();
    });

  });

  it('相互類似度', function (done) {

    var target = {
      collection: 'mails',
      attribute: 'tf',
      option: {
        out: 'mails.mutual'
      }
    };

    var searcher = new Searcher(mongo.url(), FIELD, FREQ);

    searcher.mutualize(target, function (err) {
      done();
    });

  });


  it('検索実行 & 主座標分析', function (done) {

    var target = {
      collection: 'mails',
      option: {
        condition: {
          'tf': 'iPhone TPP STAP NISA GPS'
        },
        copy: ['subject'],
        out: 'mails.search.result'
      }
    };

    var searcher = new Searcher(mongo.url(), FIELD, FREQ);

    searcher.search(target, function (err) {
      if (err) {
        console.log(err);
      } else {

        var target = {
          collection: 'mails.search.result',
          attribute: 'tf',
          option: {
            field: ['x', 'y']
          }
        };

        var source = {
          collection: 'mails.mutual',
          option: {
          }
        };

        searcher.cmdscale(target, source, function (err) {
          done();
        });

      }
    });

  });

});


