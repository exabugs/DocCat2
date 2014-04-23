/**
 * Created by dreamarts on 2014/03/30.
 */

var _ = require('underscore')
  , log = require('log')
  , should = require("should")
  , extend = require('../../lib/extend')
  ;

describe('extend', function () {

  describe('オブジェクト操作', function () {

    it('getValue', function () {

      var target = {a: {b: {c: 'xxx'}}};

      should.equal(extend.getValueEx(target, 'a.b.c'), 'xxx');

      should.equal(extend.getValueEx(target, 'a.b.d'), undefined);

    });

    it('setValue', function () {

      var target = {a: {b: {c: 'xxx'}}};

      extend.setValueEx(target, 'a.b.d', 'yyy');

      should.equal(extend.getValueEx(target, 'a.b.c'), 'xxx');

      should.equal(extend.getValueEx(target, 'a.b.d'), 'yyy');

    });

    it('hasValueEx', function () {

      var target = {a: {b: {c: 'xxx'}}};

      should.equal(extend.hasValueEx(target, 'a.b.c'), true);

      should.equal(extend.hasValueEx(target, 'a.b.d'), false);

    });

    it('delValueEx', function () {

      var target = {a: {b: {c: 'xxx'}}};

      extend.delValueEx(target, 'a.b.c')

      should.equal(extend.hasValueEx(target, 'a.b.c'), false);

      should.equal(extend.hasValueEx(target, 'a.b.d'), false);

    });

  });

});
