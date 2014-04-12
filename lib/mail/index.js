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

  var parser = new MailParser({streamAttachments: true});

  async.waterfall([
    function (done) {
      var attachements = [];
      stream.pipe(parser);
      parser.on("end", function (mail) {
        var info = to_info(mail, attachements);
        done(null, info);
      });
      parser.on("attachment", function (attachment) {
        var _id = new ObjectID();
        attachements.push({
          _id: _id,
          filename: attachment.generatedFileName
        })

        var path = '/tmp/' + _id.toString() + '.%%%';
        var ws = fs.createWriteStream(path);
        attachment.stream.pipe(ws);

        ws.on('close', function () {
          mongo.open(function (err, db) {
            var gs = new mongodb.GridStore(db, _id, attachment.generatedFileName, "w");
            gs.writeFile(path, function (err, result) {
              fs.unlink(path);
              db.close();
            });
          });
        });
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
