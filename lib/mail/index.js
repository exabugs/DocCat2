/*
 * Mail
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
    };
    res.send(info);

  });
};

/**
 *
 * @param stream RFC2822(eml形式) stream
 * @param callback
 */
function add(stream, callback) {

  async.waterfall([
    // パース
    function (done) {
      _parse(stream, function (err, mailInfo) {
        done(err, mailInfo);
      });
    },
    // DB登録
    function (mailInfo, done) {
      _insert(mailInfo, function (err, mailInfo) {
        done(err, mailInfo);
      });
    }
  ], function (err, mailInfo) {
    callback(err, mailInfo);
  });

}

function _parse(stream, done) {

  function StuructureInfo() {
    this.count = 0;
    this.array = [];
    this.flag = false;
  }

  StuructureInfo.prototype.end = function () {
    return !this.flag || (this.flag && this.count === 0);
  };

  var bodiesInfo = new StuructureInfo(); // 本文
  var attachInfo = new StuructureInfo(); // 添付ファイル
  var mailInfo = null;

  var parser = new MailParser({streamAttachments: true});

  stream.pipe(parser);

  parser.on("end", function (mail) {
    mailInfo = {
      from: mail.from,
      to: mail.to,
      cc: mail.cc,
      subject: mail.subject,
      messageId: mail.messageId,
      date: (new moment(mail.date)).toDate()
    };
    if (mail.text) {
      parser.emit('attachment', {info: bodiesInfo, buffer: mail.text, contentType: 'text/plain'});
    }
    if (mail.html) {
      parser.emit('attachment', {info: bodiesInfo, buffer: mail.html, contentType: 'text/html'});
    }
    end();
  });

  parser.on("attachment", function (attachment) {
    var info = attachment.info || attachInfo;
    info.flag = true;
    info.count++;
    add(attachment, function (attach) {
      info.array.push(attach);
      info.count--;
      end();
    });
  });

  function add(attachment, callback) {
    var _id = new ObjectID();
    var attach = {
      _id: _id,
      filename: attachment.generatedFileName,
      contentType: attachment.contentType,
      contentId: attachment.contentId,
      path: '/tmp/' + _id.toString() + '.%%%'
    };
    if (attachment.stream) {
      var ws = fs.createWriteStream(attach.path);
      attachment.stream.pipe(ws);
      ws.on('close', function () {
        callback(attach);
      });
    }
    if (attachment.buffer) {
      fs.writeFile(attach.path, attachment.buffer, function (err) {
        callback(attach);
      });
    }
  }

  function end() {
    if (bodiesInfo.end() && attachInfo.end()) {
      mailInfo.attachments = attachInfo.array;
      mailInfo.bodies = bodiesInfo.array;
      done(null, mailInfo);
    }
  }
}

function _delete(mailInfo, done) {
  async.waterfall([
    function (done) {
      mongo.open(function (err, db) {
        done(err, db);
      });
    },
    function (db, done) {
      _delete_files(db, mailInfo.bodies, function (err) {
        done(err, db);
      });
    },
    function (db, done) {
      _delete_files(db, mailInfo.attachments, function (err) {
        done(err, db);
      });
    },
    function (db, done) {
      var collection = db.collection('mails');
      collection.remove({_id: mailInfo._id}, function (err, result) {
        done(err, db);
      });
    }
  ], function (err, db) {
    db.close();
    done(err, mailInfo);
  });
}

function _insert(mailInfo, done) {
  async.waterfall([
    function (done) {
      mongo.open(function (err, db) {
        done(err, db);
      });
    },
    function (db, done) {
      _insert_files(db, mailInfo.bodies, function (err) {
        done(err, db);
      });
    },
    function (db, done) {
      _insert_files(db, mailInfo.attachments, function (err) {
        done(err, db);
      });
    },
    function (db, done) {
      var collection = db.collection('mails');
      collection.insert(mailInfo, function (err, result) {
        done(err, db);
      });
    }
  ], function (err, db) {
    db.close();
    done(err, mailInfo);
  });
}

// path のファイルを MongoDB に取り込む
function _insert_files(db, array, callback) {
  async.each(array, function (file, next) {
    var option = {content_type: file.contentType};
    var gs = new mongodb.GridStore(db, file._id, file.filename, "w", option);
    gs.writeFile(file.path, function (err, result) {
      fs.unlink(file.path);
      delete file.path;
      file.length = result.position;
      next();
    });
  }, function (err) {
    callback(err);
  });
}

// MongoDB から _id のファイルを 削除
function _delete_files(db, array, callback) {
  async.each(array, function (file, next) {
    file.path && fs.unlink(file.path);
    var gs = new mongodb.GridStore(db, file._id, "r");
    gs.unlink(function () {
      next();
    });
  }, function (err) {
    callback(err);
  });
}