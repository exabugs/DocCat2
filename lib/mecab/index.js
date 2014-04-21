/*
 * MeCab
 * @author exabugs@gmail.com
 */

"use strict";

var spawn = require('child_process').spawn
  , csv = require('csv')
  ;

module.exports.MeCab = MeCab;

function MeCab() {
}

/**
 * parse
 * @param input string or stream
 * @returns {*|CursorStream|null}
 */
MeCab.prototype.parse = function (input) {

  var mecab = spawn('mecab');

  var process = csv().from.stream(mecab.stdout, {delimiter: '\t', quote: null});

  if ('string' === typeof input) {
    mecab.stdin.write(input);
    mecab.stdin.end();
  } else {
    input.pipe(mecab.stdin);
  }

  process.transform(function (record, index, next) {
    if (1 < record.length) {
      var result = [record[0]];
      next(null, result.concat(record[1].split(',')));
    } else {
      next(null, record);
    }
  });

  return process;
};
