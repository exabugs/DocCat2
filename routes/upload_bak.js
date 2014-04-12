/*
 * GET users listing.
 */

var fs = require('fs')
  , async = require('async')
  , spawn = require('child_process').spawn
  , csv = require('csv')
  ;

var data = ["会社で仕事する。昼ごはんを作って食べる。コーヒーを飲む。", "大連に出張する。", "銀行で口座を開設する。"];

exports.mecab = function (req, res) {
  // 一時ファイルのパス
  var tmp_path = req.files.file.path;

  var mecab = spawn('mecab');

  var result = {};

  var target = csv().from.stream(mecab.stdout);

  target.on('record', function (record, index) {
    if (1 < record.length) {
      var term = record[0].split('\t');
      if (term[1] == '名詞') {
        var count = result[term[0]];
        result[term[0]] = count ? count + 1 : 1;

        console.log('record ' + term[0]);
      }
    }
  });

  target.on('error', function (error) {
    console.log('stderr: ' + error);
  });

  target.on('end', function (count) {
    console.log('end: count ' + count);
    res.send({title: "respond with a resource", count: count, data: result});
  });

  async.each(data, function (item, next) {
    mecab.stdin.write(item);
    next(null);
  }, function (err) {
    mecab.stdin.end();
  });

};

exports.mecab_only = function (req, res) {
  // 一時ファイルのパス
  var tmp_path = req.files.file.path;

  var mecab = spawn('mecab');

  var result = [];

  mecab.stdout.on('data', function (record, index) {

    result.push(record.toString());
    console.log('record ' + record);
  });

  mecab.on('error', function (error) {
    console.log('stderr: ' + error);
  });

  mecab.on('close', function (count) {
    console.log('close: count ' + count);
    res.send({title: "respond with a resource", count: count, data: result});
  });

  async.each(data, function (item, next) {

    mecab.stdin.write(item);
    next(null);
  }, function (err) {
    mecab.stdin.end();
  });

};

exports.mecab_success = function (req, res) {
  // 一時ファイルのパス
  var tmp_path = req.files.file.path;

  var mecab = spawn('mecab');

  //fs.createReadStream(tmp_path).pipe(mecab.stdin);


  var result = {};

  var target = csv().from.stream(mecab.stdout);
//    .to.stream(fs.createWriteStream('/dev/null'));

  target.on('record', function (record, index) {
    if (1 < record.length) {
      var term = record[0].split('\t');
      if (term[1] == '名詞') {
        var count = result[term[0]];
        result[term[0]] = count ? count + 1 : 1;

        console.log('record ' + term[0]);
      }
    }
  });

  target.on('error', function (error) {
    console.log('stderr: ' + error);
  });

  target.on('end', function (count) {
    console.log('end: count ' + count);
    res.send({title: "respond with a resource", count: count, data: result});
  });

  target.on('close', function (count) {
    console.log('close: count ' + count);
    res.send({title: "respond with a resource", count: count, data: result});
  });

  async.each(data, function (item, next) {

    mecab.stdin.write(item);
    next(null);
  }, function (err) {
    mecab.stdin.end();
  });

};

exports.mecab2 = function (req, res) {
  // 一時ファイルのパス
  var tmp_path = req.files.file.path;

  var mecab = spawn('mecab');

  fs.createReadStream(tmp_path).pipe(mecab.stdin);

  var result = {};

  var target = csv().from.stream(mecab.stdout)
    .to.stream(fs.createWriteStream('/dev/null'));

  target.on('record', function (record, index) {
    if (1 < record.length) {
      var term = record[0].split('\t');
      if (term[1] == '名詞') {
        var count = result[term[0]];
        result[term[0]] = count ? count + 1 : 1;

        console.log('record ' + term[0]);
      }
    }
  });

  target.on('error', function (error) {
    console.log('stderr: ' + error);
  });

  target.on('close', function (count) {
    console.log('close: count ' + count);
    res.send({title: "respond with a resource", count: count, data: result});
  });

};

exports.doccat = function (req, res) {
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
