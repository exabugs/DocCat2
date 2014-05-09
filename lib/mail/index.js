/*
 * Mail
 */

var _ = require('underscore')
  , mongodb = require('mongodb')
  , GridStore = mongodb.GridStore
  , ObjectID = mongodb.ObjectID
  , fs = require('fs')
  , async = require('async')
  , moment = require('moment')
  , MailParser = require('mailparser').MailParser
  , mongo = require('../db')
  , spawn = require('child_process').spawn
  , Searcher = require('node-searcher')
  ;

var GRID_ROOT = 'mails';
var COLLECTION = 'mails';

exports.http_add = function (req, res) {

  // アップロードファイル
  var path = req.files.mail.path;

  this.add(path, function (err, result) {

    // ファイル削除
    fs.unlink(path);

    var info = {
      subject: result.subject,
      to: result.to
    };
    res.send(info);

  });
};

/**
 * 取得
 * @param condition
 * @param callback
 */
exports.get = function (condition, callback) {

  async.waterfall([
    function (done) {
      mongo.open(function (err, db) {
        done(err, db);
      });
    },
    function (db, done) {
      var collection = db.collection(COLLECTION);
      collection.find(condition).toArray(function (err, array) {
        done(err, db, array);
      });
    }
  ], function (err, db, array) {
    db.close();
    callback(err, array);
  });
}

/**
 * 追加
 * @param stream RFC2822(eml形式) stream
 * @param callback
 */
exports.add = function (path, callback) {

  async.waterfall([
    function (done) {
      mongo.open(function (err, db) {
        done(err, db);
      });
    },
    // GridStore登録
    function (db, done) {
      var _id = new ObjectID();
      var option = {root: GRID_ROOT, content_type: 'message/rfc822'};
      var wgs = new GridStore(db, _id, _id.toString(), 'w', option);
      wgs.writeFile(path, function (err, wgs) {
        wgs._id = _id;
        done(err, db, wgs);
      });
    },
    // GridStore取得
    function (db, wgs, done) {
      var option = {root: GRID_ROOT};
      var rgs = new GridStore(db, wgs._id, 'r', option);
      rgs.open(function (err, rgs) {
        rgs._id = wgs._id;
        done(err, db, rgs);
      });
    },
    // パース
    function (db, gs, done) {
      _parse(db, gs, function (err, mailInfo) {
        done(err, db, mailInfo);
      });
    },
    // DB登録
    function (db, mailInfo, done) {
      _insert(db, mailInfo, function (err, mailInfo) {
        done(err, db, mailInfo);
      });
    },
    // 形態素解析
    function (db, mailInfo, done) {
      var searcher = new Searcher(mongo.url(), ['k', 'c']);

      var source = {
        collection: 'mails.files',
        attribute: 'metadata.tf',
        option: {
          condition: {
            'contentType': 'text/plain',
            'metadata.parent': mailInfo._id
          }
        }
      };

      searcher.parse(source, function (err, count) {
        done(err, db, mailInfo);
      });
    }
  ], function (err, db, mailInfo) {
    db.close();
    callback(err, mailInfo);
  });
}

function _parse(db, gs, done) {

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

  gs.seek(0, function (err, store) {
    var stream = store.stream(true);
    stream.pipe(parser);
  });

  parser.on('end', function (mail) {
    mailInfo = {
      from: mail.from,
      to: mail.to,
      cc: mail.cc,
      subject: mail.subject,
      messageId: mail.messageId,
      date: (new moment(mail.date)).toDate(),
      origin: {
        _id: gs._id,
        length: gs.length
      }
    };
    if (mail.text) {
      parser.emit('attachment', {info: bodiesInfo, buffer: mail.text, contentType: 'text/plain'});
    }
    if (mail.html) {
      parser.emit('attachment', {info: bodiesInfo, buffer: mail.html, contentType: 'text/html'});
    }
    end();
  });

  parser.on('attachment', function (attachment) {
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

function _delete(db, mailInfo, done) {
  async.waterfall([
    function (done) {
      _delete_files(db, mailInfo.bodies, function (err) {
        done(err);
      });
    },
    function (done) {
      _delete_files(db, mailInfo.attachments, function (err) {
        done(err);
      });
    },
    function (done) {
      var collection = db.collection(COLLECTION);
      collection.remove({_id: mailInfo._id}, function (err, result) {
        done(err);
      });
    }
  ], function (err) {
    done(err, mailInfo);
  });
}

function _insert(db, mailInfo, done) {
  mailInfo._id = new ObjectID();
  var metadata = {
    parent: mailInfo._id,
    origin: {_id: mailInfo.origin._id, messageId: mailInfo.messageId}
  };
  async.waterfall([
    function (done) {
      _insert_files(db, metadata, mailInfo.bodies, function (err) {
        done(err);
      });
    },
    function (done) {
      _insert_files(db, metadata, mailInfo.attachments, function (err) {
        done(err);
      });
    },
    function (done) {
      var collection = db.collection(COLLECTION);
      collection.insert(mailInfo, function (err, result) {
        done(err);
      });
    }
  ], function (err) {
    done(err, mailInfo);
  });
}

// path のファイルを MongoDB に取り込む
function _insert_files(db, metadata, array, callback) {
  async.each(array, function (file, next) {
    metadata.filename = file.filename;
    var option = {content_type: file.contentType, root: GRID_ROOT, metadata: metadata};
    var gs = new GridStore(db, file._id, file._id.toString(), 'w', option);
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
    var gs = new GridStore(db, file._id, "r");
    gs.unlink(function () {
      next();
    });
  }, function (err) {
    callback(err);
  });
}