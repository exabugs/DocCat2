/*
 * GET users listing.
 */

var _ = require('underscore')
  , fs = require('fs')
  , async = require('async')
  , spawn = require('child_process').spawn
  , csv = require('csv')
  ;

/**
 * DocCat
 *
 * @param req
 * @param res
 */
exports.doccat = function (req, res) {

  // アップロードファイル
  var file = req.files.file.path;

  _doccat(file, '/opt/doccat/', 1000, function (err, result) {

    // ファイル削除
    fs.unlink(file);

    res.send(result);

  });
}

/**
 * DocCat
 *
 * @param file    処理対象ファイル
 * @param dir     実行形式フォルダ
 * @param timeout 最大処理時間(msec)
 * @param callback
 * @private
 */
function _doccat(file, dir, timeout, callback) {

  // 実行形式一蘭
  var processes = _.map(fs.readdirSync(dir), function (exe) {
    return dir + exe;
  });

  // 処理開始時刻
  var start = new Date().getTime();

  async.map(processes, function (process, done) {

    var result = {process: process, data: ""};
    var process = spawn(process, [file]);

    process.stdout.on('data', function (data) {
      result.data += data;
    });

    process.on('close', function (code) {
      result.time = new Date().getTime() - start; // 処理時間
      result.code = code; // リターンコード
      done(null, result);
    });

    setTimeout(function () {
      process.kill('SIGHUP');
    }, timeout);

  }, function (err, results) {

    callback(err, _.max(results, function (result) {
      return result.data.length;
    }));

  });

}

exports.mecab = function (req, res) {

  var mecab = spawn('mecab');

  var result = {};

  var process = csv().from.stream(mecab.stdout);

  process.on('record', function (record, index) {
    if (1 < record.length) {
      var term = record[0].split('\t');
      if (term[1] == '名詞') {
        var count = result[term[0]];
        result[term[0]] = count ? count + 1 : 1;

        console.log('record ' + term[0]);
      }
    }
  });

  process.on('error', function (error) {
    console.log('stderr: ' + error);
  });

  process.on('end', function (count) {
    console.log('end: count ' + count);
    res.send({title: "respond with a resource", count: count, data: result});
  });

  if (req.files.file.size) {
    // 一時ファイルのパス
    var tmp_path = req.files.file.path;

    fs.createReadStream(tmp_path).pipe(mecab.stdin);

  } else {

    var data = ["会社で仕事する。昼ごはんを作って食べる。コーヒーを飲む。", "中国に出張する。", "銀行で口座を開設する。"];

    async.each(data, function (item, next) {
      mecab.stdin.write(item);
      next(null);
    }, function (err) {
      mecab.stdin.end();
    });
  }
};

exports.doccat_simple = function (req, res) {
  // 一時ファイルのパス
  var tmp_path = req.files.file.path;

  var doccat = spawn('cat', [tmp_path]);

  doccat.stdout.on('data', function (data) {
    console.log('data: ' + data);
  });

  doccat.on('error', function (error) {
    console.log('stderr: ' + error);
  });

  doccat.on('close', function (count) {
    console.log('close: count ' + count);
    res.send({title: "respond with a resource", count: count});
  });

};
