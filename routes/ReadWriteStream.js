var events = require('events')
  , util = require('util')
  , stream = require('stream')
  ;

function ReadWriteStream() {
  events.EventEmitter.call(this);
  this.readable = true;
  this.writable = true;
}

util.inherits(ReadWriteStream, events.EventEmitter);
util.inherits(ReadWriteStream, stream.Stream);

// Each of these methods just triggers an event with the same name and calling parameters
[
  // Readable Stream
  // 'data' is only an event triggered by .write()
  'end'
  , 'error'
  , 'close'
  , 'setEncoding'
  , 'pause'
  , 'resume'
  , 'destroy'
  //, 'pipe' // currently not supported, inherit from Stream if you want this

  // Writable Stream
  , 'drain'
  //, 'error'
  //, 'close'
  //, 'pipe'
  , {name: 'write', event: 'data'}
  , 'destroySoon'

].forEach(function (func) {
    ReadWriteStream.prototype[func.name || func] = (function (func) {
      var event = func.event || func;
      return function () {
        var args = Array.prototype.slice.call(arguments);
        args.unshift(event);
        this.emit.apply(this, args);
      };
    }(func));

  });

module.exports = ReadWriteStream;