/*
 * GET users listing.
 */

var _ = require('underscore')
  , mongodb = require("mongodb")
  , ObjectID = mongodb.ObjectID
  , fs = require('fs')
  , async = require('async')
  , moment = require("moment")
  , MailParser = require("mailparser").MailParser
  , mongo = require("../db")
  , spawn = require('child_process').spawn

  ;

exports.http_add = function (req, res) {

  // アップロードファイル
  var file = req.files.mail.path;

  add(fs.createReadStream(file), function (err, result) {

    // ファイル削除
    fs.unlink(file);

    var info = {
      subject: result.subject,
      to: result.to
    }
    res.send(info);

  });
}

/**
 *
 * @param stream RFC2822(eml形式) stream
 * @param callback
 */
function add(stream, callback) {

  async.waterfall([

    // パース
    function (done) {
      var attachments = [];
      var attach_count = 0;
      var has_attachments = false;
      var mailInfo = null;
      var parser = new MailParser({streamAttachments: true});
      stream.pipe(parser);
      parser.on("end", function (mail) {
        mailInfo = {
          from: mail.from,
          to: mail.to,
          cc: mail.cc,
          subject: mail.subject,
          text: mail.text,
          messageId: mail.messageId,
          date: (new moment(mail.date)).toDate()
        }
        end();
      });
      parser.on("attachment", function (attachment) {
        has_attachments = true;
        attach_count++;
        add(attachment, function (attach) {
          attachments.push(attach);
          attach_count--;
          end();
        })
      });
      function add(attachment, callback) {
        var _id = new ObjectID();
        var attach = {
          _id: _id,
          filename: attachment.generatedFileName,
          contentType: attachment.contentType,
          contentId: attachment.contentId,
          length: attachment.length,
          path: '/tmp/' + _id.toString() + '.%%%'
        }
        var ws = fs.createWriteStream(attach.path);
        attachment.stream.pipe(ws);
        ws.on('close', function () {
          callback(attach);
        });
      }

      function end() {
        if (!has_attachments || (has_attachments && attach_count === 0)) {
          mailInfo.attachments = attachments;
          done(null, mailInfo);
        }
      }
    },

    // DB登録
    function (mailInfo, done) {
      async.waterfall([
        function (done) {
          mongo.open(function (err, db) {
            done(null, db);
          });
        },
        function (db, done) {
          async.each(mailInfo.attachments, function (attach, next) {
            var gs = new mongodb.GridStore(db, attach._id, attach.filename, "w");
            gs.writeFile(attach.path, function (err, result) {
              fs.unlink(attach.path);
              delete attach.path;
              attach.length = result.position;
              next();
            });
          }, function (err) {
            done(err, db);
          });
        },
        function (db, done) {
          var collection = db.collection('mails');
          collection.insert(mailInfo, function (err, result) {
            done(null, db, mailInfo);
          });
        },
        function (db, meilInfo, done) {
          db.close();
          done(null, mailInfo);
        }
      ], function (err, mailInfo) {
        done(null, mailInfo);
      });
    }
  ], function (err, mailInfo) {
    callback(err, mailInfo);
  });

}

