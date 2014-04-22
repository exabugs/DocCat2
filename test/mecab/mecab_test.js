/**
 * MeCab
 * @author exabugs@gmail.com
 */

"use strict";

var should = require('should')
  , fs = require('fs')
  , MeCab = require('node-wakame')
  ;

describe('MeCab', function () {

  it('Case 1 : String', function (done) {

    var input = '今日は残業。明日も残業。';
    var process = MeCab.parse(input);

    var result = {};

    process.on('record', function (record, index) {
      if (record[1] === '名詞') {
        var count = result[record[0]];
        result[record[0]] = count ? ++count : 1;
      }
    });

    process.on('error', function (error) {
      done(error);
    });

    process.on('end', function (count) {
      result.should.eql({ '今日': 1, '残業': 2, '明日': 1 });
      done(null, result, count);
    });

  });

  it('Case 2: Stream', function (done) {

    var input = fs.createReadStream('test/mecab/data.txt');
    var process = MeCab.parse(input);

    var result = {};

    process.on('record', function (record, index) {
      if (record[1] === '名詞') {
        var count = result[record[0]];
        result[record[0]] = count ? ++count : 1;
      }
    });

    process.on('error', function (error) {
      done(error);
    });

    process.on('end', function (count) {
      result.should.eql({ '今日': 1, '残業': 2, '明日': 1 });
      done(null, result, count);
    });

  });

});

