/**
 * Created by dreamarts on 2014/03/30.
 */

var assert = require('assert')
  , log = require('log')
  , fs = require('fs')
  , MailParser = require("mailparser").MailParser
  , async = require('async')

  , db = require("../../lib/db")

  ;

describe('mail', function () {
  describe('#indexOf()', function () {
    it('should return -1 when the value is not present', function (done) {

      var array = [];
      async.waterfall([
        function(next) {
          for (var i = 0; i < 3; i++) {
             var item = {stream: fs.createReadStream('test/mail/test.eml')};
            array.push(item);
          }
          next(null, item);
        },
        function(item, next) {
          async.eachSeries(array, function(tgt, next1) {
            var ws = fs.createWriteStream('/tmp/test.eml');
            item.stream.pipe(ws);
            ws.on('close', function() {
              next1();
            });

          }, function (err) {
            next(null);

          });
        }
      ], function (err) {
        done();
      });
    });
  })
})


