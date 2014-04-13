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
//  , spawn = require('child_process').spawn
//  , csv = require('csv')
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

function add(stream, callback) {

  async.waterfall([
    function (done) {

      mongo.open(function (err, db) {

        var attachements = [];
        var attach_count = 0;
        var mail_info = null;

        var parser = new MailParser({streamAttachments: true});

        stream.pipe(parser);

        parser.on("end", function (mail) {
          mail_info = to_info(mail, attachements);
          if (attachements.length === 0) {
            end();
          }
        });

        parser.on("attachment", function (attachment) {
          attach_count++;
          var info = {
            _id: new ObjectID(),
            filename: attachment.generatedFileName
          }
          attachements.push(info);

          var path = '/tmp/' + info._id.toString() + '.%%%';
          var ws = fs.createWriteStream(path);
          attachment.stream.pipe(ws);

          ws.on('close', function () {
            var gs = new mongodb.GridStore(db, info._id, info.filename, "w");
            gs.writeFile(path, function (err, result) {
              fs.unlink(path);
              if (--attach_count === 0 && mail_info) {
                end();
              }
            });
          });
        });

        function end() {
          db.close();
          done(null, mail_info);
        }
      });
    },
    function (info, done) {
      mongo.open(function (err, db) {
        var collection = db.collection('mails');
        collection.insert(info, function (err, result) {
          db.close();
          done(null, db, info);
        });
      });
    }
  ], function (err, db, info) {
    callback(err, info);
  });


}


function to_info(obj, attachments) {
  return {
    from: obj.from,
    to: obj.to,
    cc: obj.cc,
    subject: obj.subject,
    messageId: obj.messageId,
    date: (new moment(obj.date)).toDate(),
    attachments: attachments
  }

}
