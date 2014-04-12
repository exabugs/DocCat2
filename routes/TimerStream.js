/**
 * Created by dreamarts on 2014/03/30.
 */

var stream = require('stream')
  , util = require('util')
  , log = console.log.bind(console)
  ;

// 本来は 'data', 'end', 'error', 'close' イベントが必要
function TimerStream() {
  this.readable = true;
  this.t = 0;
  this.timer = null;
  this.piped = false;
}

// 継承、詳細は util.inherits を参照
util.inherits(TimerStream, stream.Stream);

/*
TimerStream.prototype.resume = function () {



  this.timer = setInterval(function () {

    this.t++;

    if (this.t > 50) {
      clearInterval(this.timer);
      return this.emit('end');
    }

    for (i = 0; i < 1000; i++) {

      var data = '"a","' + this.t + '","a","b","c","a","b","c","a","b","c","a","b","c","a","b","c","a","b","c","a","b","c"\n';
      this.emit('data', data);
    }

  }.bind(this), 0);

};
*/

TimerStream.prototype.pause = function () {
  clearInterval(this.timer);
};

TimerStream.prototype.pipe = function (dest) {
  this.piped = true;
  stream.Stream.prototype.pipe.apply(this, arguments);


  this.timer = setInterval(function () {
    this.t++;
    if (this.t > 50) {
      clearInterval(this.timer);
      return this.emit('end');
    }
    for (i = 0; i < 1000; i++) {

      var data = '"a","' + this.t + '","a","b","c","a","b","c","a","b","c","a","b","c","a","b","c","a","b","c","a","b","c"\n';
      this.emit('data', data);
    }
  }.bind(this), 0);

};

TimerStream.prototype.setEncoding = function (encoding) {
};
TimerStream.prototype.destroy = function () {
};
TimerStream.prototype.destroySoon = function () {
};

module.exports = TimerStream;

if (require.main === module) {
  var timerStream = new TimerStream();
  timerStream.pipe(process.stdout);
  timerStream.resume();
}
