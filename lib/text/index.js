/*
 * GET users listing.
 */

var _ = require('underscore')
  , mongodb = require('mongodb')
  , GridStore = mongodb.GridStore
  , fs = require('fs')
  , async = require('async')
  , spawn = require('child_process').spawn
  , csv = require('csv')
  , stream = require('stream')
  , MeCab = require('node-wakame')
  , extend = require('../extend')
  , vector = require('../vector')
  ;

// https://github.com/mongodb/node-mongodb-native/pull/1165
var mr_util = {}
_.extend(mr_util, extend);

exports.search = function (db, collection, collection_df, condition, text, callback) {

  var attr = 'metadata.tf';

  if (!text) text = "";

  var tasks = [];
  tasks.push(function (done) {
    exports.tf(text, function (err, keyword) {
      done(err, keyword);
    });
  });
  tasks.push(function (keyword, done) {
    exports.frequency_map(collection_df, keyword, function (err, map) {
      done(err, keyword, map);
    });
  });
  tasks.push(function (keyword, map, done) {

    var words = _.pluck(keyword, 'k');
    if (0 < words.length) {
      condition[[attr, 'k'].join('.')] = {$in: words};
    }

    var target = 'metadata.tf';
    var field = {key: 'k', val: 'c'};
    var out =  {inline: 1};

    vector.cosine(collection, condition, target, field, keyword, map, out, function(err, result) {
      return done(err, result);
    });

  });
  async.waterfall(tasks, function (err, result) {
    callback(err, result);
  });
};

exports.batch = function (db, src, dst, condition, callback) {
  var collection = db.collection(src + '.files');
  var cursor = collection.find(condition, {_id: 1, contentType: 1});

  var count = 0;
  cursor.each(function (err, item) {
    if (item) {
      ++count;
      exports.patch(db, src, item._id, collection, function (err) {
        if (--count == 0) {
          callback(err);
        }
      });
    }
  });
};

/**
 *
 * @param db
 * @param src src.files の src 部分の名前
 * @param _id src.files の _id
 * @param out
 * @param callback
 */
exports.patch = function (db, src, _id, out, callback) {
  var option = {root: src};
  var gs = new GridStore(db, _id, 'r', option);
  gs.open(function (err, gs) {
    err && callback(err);
    exports.tf(gs.stream(true), function (err, tf) {
      var userdata = {tf: tf};
      out.update({_id: _id}, {$set: {metadata: userdata}}, function (err, result) {
        callback(err, result);
      });
    })
  });
}

/**
 * TF
 * @param input 文字列 or ストリーム
 * @param callback
 */
exports.tf = function (input, callback) {
  exports.parse(input, function (err, result) {
    err && callback(err);
    var tf = _.map(result, function (value, key) {
      return {k: key, c: value};
    });
    tf = _.sortBy(tf, function (v) {
      return v.k;
    });
    callback(err, tf);
  });
}

exports.frequency_map = function (collection, keyword, callback) {

  if (collection == null) {
    callback(null, null);
    return;
  }

  var words = _.pluck(keyword, 'k');
  var condition = {_id: {$in: words}};

  var map = null;
  collection.find(condition).toArray(function (err, items) {
    if (err) {
      callback(err, map);
    } else {
      map = _.reduce(items, function (memo, item) {
        memo[item._id] = item.value;
        return memo;
      }, {});
      callback(err, map);
    }
  });

}

exports.object_frequency = function (collection, out, callback) {

  var attr = 'metadata.tf';

  var condition = {};
  condition[attr] = {$exists: 1};

  collection.mapReduce(
    function () {
      util.getValue(this, attr).forEach(function(item) {
        emit(item['k'], 1);
      });
    },
    function (key, values) {
      return Array.sum(values);
    },
    {
      scope: {util: mr_util, attr: attr},
      query: condition,
      out: out
    },
    function (err, results) {
      callback(err, results);
    }
  );
}


/**
 *
 * @param input 文字列 or ストリーム
 * @param callback [ { 名詞 : 個数 }, ... ]
 */
exports.parse = function (input, callback) {

  var info = {
    "名詞": {"一般": 1, "固有名詞": 1, "数": 1, "サ変接続": 1, "形容動詞語幹": 1, "副詞可能": 1}
  };

  var mecab = spawn('mecab');

  var result = {};

  var process = MeCab.parse(input);

  process.on('record', function (record, index) {
    if (1 < record.length) {
      var term = record[0];
      var cond1 = record[1];
      var cond2 = record[2];
      if (info[cond1] && info[cond1][cond2]) {
        var count = result[term];
        result[term] = count ? count + 1 : 1;
      }
    }
  });

  process.on('error', function (error) {
    callback(error);
  });

  process.on('end', function (count) {
    callback(null, result);
  });

};

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
};

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
