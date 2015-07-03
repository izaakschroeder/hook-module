
var expect = require('chai').expect;
var hijack = require('../../lib/hook');

describe('hook', function() {

	describe('single hooks', function() {
		var hook = hijack({
			enabled: false,
			test: function(request) {
				return request === '!foo';
			},
			resolve: function(request) {
				return '/some/magic/file.js';
			},
			handler: function(module) {
				module.exports = 'Hello World';
			}
		});

		beforeEach(function() {
			hook.enable();
		});

		afterEach(function() {
			hook.disable();
		});

		it('should only hook when test is true', function() {
			expect(require('!foo')).to.equal('Hello World');
			expect(function() {
				require('!bar');
			}).to.throw(Error);
		});

		it('should only hook when enabled', function() {
			hook.disable();
			expect(function() {
				require('!foo');
			}).to.throw(Error);
		});
	});

	describe('multiple hooks', function() {
		var a = hijack({
			enabled: false,
			test: function(request) {
				return request === '!foo';
			},
			resolve: function(request) {
				return '/some/magic/file.js';
			},
			handler: function(module) {
				module.exports = 'foo';
			}
		}), b = hijack({
			enabled: false,
			test: function(request) {
				return request === '!foo';
			},
			resolve: function(request) {
				return '/some/other/file.js';
			},
			handler: function(module) {
				module.exports = 'bar';
			}
		});

		beforeEach(function() {
			a.enable();
			b.enable();
		});

		afterEach(function() {
			b.disable();
			a.disable();
		});

		it('should use the most recent hook first', function() {
			expect(require('!foo')).to.equal('bar');
		});

		it('should respect disabled hooks', function() {
			expect(require('!foo')).to.equal('bar');
			b.disable();
			expect(require('!foo')).to.equal('foo');
		});
	});

});
