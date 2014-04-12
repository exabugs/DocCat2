/**
 * Created by dreamarts on 2014/03/30.
 */

var assert = require('assert')
  , csv = require('csv')
  , log = require('log')
  , fs = require('fs')
  , ReadWriteStream = require('../routes/ReadWriteStream')
  , TimerStream = require('../routes/TimerStream')
  ;

describe('csv', function () {
  describe('#indexOf()', function () {
    it('should return -1 when the value is not present', function (done) {

      var stream1 = new TimerStream();
      var stream2 = fs.createReadStream("test/100M.csv")

      var stream = stream1;

      var target = new csv().from.stream(stream);

      target.transform(function (row, index, next) {
        if (index % 1000 === 0) {
          setTimeout(function () {
            setTimeout(function () {
              setTimeout(function () {
                setTimeout(function () {
                  console.log(index);
                  next();
                }, 100);
              }, 100);
            }, 100);
          }, 100);
        } else {
          next();
        }
      });


      target.on('data', function (row) {
        console.log(row);
      });

      target.on('end', function (count) {
        done();
      });

      target.on('close', function (count) {
        done();
      });

     // stream.resume();

    })
  })
})
