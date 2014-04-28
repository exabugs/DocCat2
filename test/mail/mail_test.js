/**
 * Created by dreamarts on 2014/03/30.
 */

var should = require('should')
  , log = require('log')
  , fs = require('fs')
  , async = require('async')
  , mail = require('../../lib/mail')
  , mongo = require("../../lib/db")
  ;

describe('mail', function () {

  it('DB初期化', function (done) {
    mongo.open(function (err, db) {
      var colls = ['mails', 'mails.files', 'mails.chunks', 'mails.df'];
      async.each(colls, function (coll, next) {
        db.collection(coll).remove({}, function (err, reply) {
          next();
        });
      }, function (err) {
        db.close();
        done();
      });
    });
  });

  it('メールをDBに追加する', function (done) {
    var path = 'test/mail/test.eml';
    mail.add(path, function (err, mailInfo) {
      mail.get({"messageId": "1397023383.498516.1.1000481@moe.dreamarts.co.jp"}, function (err, result) {
        should.not.exist(err);
        result.length.should.eql(1);
        done();
      });
    });
  });

  /**
   it('should return -1 when the value is not present', function (done) {

      var array = [];
      async.waterfall([
        function (next) {
          for (var i = 0; i < 3; i++) {
            var item = {stream: fs.createReadStream('test/mail/test.eml')};
            array.push(item);
          }
          next(null, item);
        },
        function (item, next) {
          async.eachSeries(array, function (tgt, next1) {
            var ws = fs.createWriteStream('/tmp/test.eml');
            item.stream.pipe(ws);
            ws.on('close', function () {
              next1();
            });

          }, function (err) {
            next(null);

          });
        }
      ], function (err) {
        done();
      });
    });
   */
});


