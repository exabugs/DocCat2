/**
 * Created by dreamarts on 2014/03/30.
 */

var assert = require('assert')
  , log = require('log')
  , fs = require('fs')
  , MailParser = require("mailparser").MailParser

  , db = require(".././db/api.js")

  ;

describe('mail', function () {
  describe('#indexOf()', function () {
    it('should return -1 when the value is not present', function (done) {

      var mailparser = new MailParser();

      mailparser.on("end", function (mail_object) {
        console.log("Subject:", mail_object.subject);

        db.open(function (err, db) {

          done();

        })


      });

      fs.createReadStream("test/mail/test.eml").pipe(mailparser);

    })
  })
})

function open(code, callback) {

  var db = new Db(code || conf.dbname, new Server(
    conf.host
    , conf.port
    , constant.MOD_DB_SERVER_OPTIONS)
    , constant.MOD_DB_OPTIONS
  );

  db.open(function (err, db) {

    if (err) {
      callback(err);
      return;
    }

    // DB 认证
    if (conf.user) {
      db.authenticate(conf.user, conf.pass, function (err) {
        if (err) {
          return callback(err);
        }

        return callback(undefined, db);
      });
    } else {

      return callback(undefined, db);
    }
  });
}
