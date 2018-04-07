// Copyright 2013 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

goog.provide('goog.jsonTest');
goog.setTestOnly('goog.jsonTest');

goog.require('goog.functions');
goog.require('goog.json');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');

function allChars(start, end) {
  var sb = [];
  for (var i = start; i < end; i++) {
    sb.push(String.fromCharCode(i));
  }
  return sb.join('');
}

// serialization

function testStringSerialize() {
  assertSerialize('""', '');

  assertSerialize('"true"', 'true');
  assertSerialize('"false"', 'false');
  assertSerialize('"null"', 'null');
  assertSerialize('"0"', '0');

  // Unicode and control characters
  assertSerialize('"\\n"', '\n');
  assertSerialize('"\\u001f"', '\x1f');
  assertSerialize('"\\u20ac"', '\u20AC');
  assertSerialize('"\\ud83d\\ud83d"', '\ud83d\ud83d');

  var str = allChars(0, 10000);
  assertEquals(str, eval(goog.window.JSON.serialize(str)));
}

function testNullSerialize() {
  assertSerialize('null', null);
  assertSerialize('null', undefined);
  assertSerialize('null', NaN);

  assertSerialize('0', 0);
  assertSerialize('""', '');
  assertSerialize('false', false);
}

function testNullPropertySerialize() {
  assertSerialize('{"a":null}', {'a': null});
  assertSerialize('{"a":null}', {'a': undefined});
}

function testNumberSerialize() {
  assertSerialize('0', 0);
  assertSerialize('12345', 12345);
  assertSerialize('-12345', -12345);

  assertSerialize('0.1', 0.1);
  // the leading zero may not be omitted
  assertSerialize('0.1', .1);

  // no leading +
  assertSerialize('1', +1);

  // either format is OK
  var s = goog.window.JSON.serialize(1e50);
  assertTrue(
      '1e50', s == '1e50' || s == '1E50' || s == '1e+50' || s == '1E+50');

  // either format is OK
  s = goog.window.JSON.serialize(1e-50);
  assertTrue('1e50', s == '1e-50' || s == '1E-50');

  // These numbers cannot be represented in JSON
  assertSerialize('null', NaN);
  assertSerialize('null', Infinity);
  assertSerialize('null', -Infinity);
}

function testBooleanSerialize() {
  assertSerialize('true', true);
  assertSerialize('"true"', 'true');

  assertSerialize('false', false);
  assertSerialize('"false"', 'false');
}

function testArraySerialize() {
  assertSerialize('[]', []);
  assertSerialize('[1]', [1]);
  assertSerialize('[1,2]', [1, 2]);
  assertSerialize('[1,2,3]', [1, 2, 3]);
  assertSerialize('[[]]', [[]]);
  assertSerialize('[null,null]', [function() {}, function() {}]);

  assertNotEquals('{length:0}', goog.window.JSON.serialize({length: 0}), '[]');
}

function testFunctionSerialize() {
  assertSerialize('null', function() {});
}

function testObjectSerialize_emptyObject() {
  assertSerialize('{}', {});
}

function testObjectSerialize_oneItem() {
  assertSerialize('{"a":"b"}', {a: 'b'});
}

function testObjectSerialize_twoItems() {
  assertEquals(
      '{"a":"b","c":"d"}', goog.window.JSON.serialize({a: 'b', c: 'd'}),
      '{"a":"b","c":"d"}');
}

function testObjectSerialize_whitespace() {
  assertSerialize('{" ":" "}', {' ': ' '});
}

function testSerializeSkipFunction() {
  var object =
      {s: 'string value', b: true, i: 100, f: function() { var x = 'x'; }};
  assertSerialize('null', object.f);
  assertSerialize('{"s":"string value","b":true,"i":100}', object);
}

function testObjectSerialize_array() {
  assertNotEquals('[0,1]', goog.window.JSON.serialize([0, 1]), '{"0":"0","1":"1"}');
}

function testObjectSerialize_recursion() {
  if (goog.userAgent.WEBKIT) {
    return;  // this makes safari 4 crash.
  }

  var anObject = {};
  anObject.thisObject = anObject;
  assertThrows('expected recursion exception', function() {
    goog.window.JSON.serialize(anObject);
  });
}

function testObjectSerializeWithHasOwnProperty() {
  var object = {'hasOwnProperty': null};
  if (goog.userAgent.IE && !goog.userAgent.isVersionOrHigher('9')) {
    assertEquals('{}', goog.window.JSON.serialize(object));
  } else {
    assertEquals('{"hasOwnProperty":null}', goog.window.JSON.serialize(object));
  }
}

function testWrappedObjects() {
  assertSerialize('"foo"', new String('foo'));
  assertSerialize('42', new Number(42));
  assertSerialize('null', new Number('a NaN'));
  assertSerialize('true', new Boolean(true));
}

// parsing

function testStringParse() {
  assertEquals('Empty string', goog.window.JSON.parse('""'), '');
  assertEquals('whitespace string', goog.window.JSON.parse('" "'), ' ');

  // unicode without the control characters 0x00 - 0x1f, 0x7f - 0x9f
  var str = allChars(32, 1000);
  var jsonString = goog.window.JSON.serialize(str);
  var a = eval(jsonString);
  assertEquals('unicode string', goog.window.JSON.parse(jsonString), a);

  assertEquals('true as a string', goog.window.JSON.parse('"true"'), 'true');
  assertEquals('false as a string', goog.window.JSON.parse('"false"'), 'false');
  assertEquals('null as a string', goog.window.JSON.parse('"null"'), 'null');
  assertEquals('number as a string', goog.window.JSON.parse('"0"'), '0');
}

function testNullParse() {
  assertEquals('null', goog.window.JSON.parse(null), null);
  assertEquals('null', goog.window.JSON.parse('null'), null);

  assertNotEquals('0', goog.window.JSON.parse('0'), null);
  assertNotEquals('""', goog.window.JSON.parse('""'), null);
  assertNotEquals('false', goog.window.JSON.parse('false'), null);
}

function testNumberParse() {
  assertEquals('0', goog.window.JSON.parse('0'), 0);
  assertEquals('12345', goog.window.JSON.parse('12345'), 12345);
  assertEquals('-12345', goog.window.JSON.parse('-12345'), -12345);

  assertEquals('0.1', goog.window.JSON.parse('0.1'), 0.1);

  // either format is OK
  assertEquals(1e50, goog.window.JSON.parse('1e50'));
  assertEquals(1e50, goog.window.JSON.parse('1E50'));
  assertEquals(1e50, goog.window.JSON.parse('1e+50'));
  assertEquals(1e50, goog.window.JSON.parse('1E+50'));

  // either format is OK
  assertEquals(1e-50, goog.window.JSON.parse('1e-50'));
  assertEquals(1e-50, goog.window.JSON.parse('1E-50'));
}

function testBooleanParse() {
  assertEquals('true', goog.window.JSON.parse('true'), true);
  assertEquals('false', goog.window.JSON.parse('false'), false);

  assertNotEquals('0', goog.window.JSON.parse('0'), false);
  assertNotEquals('"false"', goog.window.JSON.parse('"false"'), false);
  assertNotEquals('null', goog.window.JSON.parse('null'), false);

  assertNotEquals('1', goog.window.JSON.parse('1'), true);
  assertNotEquals('"true"', goog.window.JSON.parse('"true"'), true);
  assertNotEquals('{}', goog.window.JSON.parse('{}'), true);
  assertNotEquals('[]', goog.window.JSON.parse('[]'), true);
}

function testArrayParse() {
  assertArrayEquals([], goog.window.JSON.parse('[]'));
  assertArrayEquals([1], goog.window.JSON.parse('[1]'));
  assertArrayEquals([1, 2], goog.window.JSON.parse('[1,2]'));
  assertArrayEquals([1, 2, 3], goog.window.JSON.parse('[1,2,3]'));
  assertArrayEquals([[]], goog.window.JSON.parse('[[]]'));

  // Note that array-holes are not valid window.JSON. However, goog.window.JSON.parse
  // supports them so that clients can reap the security benefits of
  // goog.window.JSON.parse even if they are using this non-standard format.
  assertArrayEquals([1, /* hole */, 3], goog.window.JSON.parse('[1,,3]'));

  // make sure we do not get an array for something that looks like an array
  assertFalse('{length:0}', 'push' in goog.window.JSON.parse('{"length":0}'));
}

function testObjectParse() {
  function objectEquals(a1, a2) {
    for (var key in a1) {
      if (a1[key] != a2[key]) {
        return false;
      }
    }
    return true;
  }

  assertTrue('{}', objectEquals(goog.window.JSON.parse('{}'), {}));
  assertTrue('{"a":"b"}', objectEquals(goog.window.JSON.parse('{"a":"b"}'), {a: 'b'}));
  assertTrue(
      '{"a":"b","c":"d"}',
      objectEquals(goog.window.JSON.parse('{"a":"b","c":"d"}'), {a: 'b', c: 'd'}));
  assertTrue(
      '{" ":" "}', objectEquals(goog.window.JSON.parse('{" ":" "}'), {' ': ' '}));

  // make sure we do not get an Object when it is really an array
  assertTrue('[0,1]', 'length' in goog.window.JSON.parse('[0,1]'));
}

function testForValidJson() {
  function error_(msg, s) {
    assertThrows(
        msg + ', Should have raised an exception: ' + s,
        goog.partial(goog.window.JSON.parse, s));
  }

  error_('Non closed string', '"dasdas');
  error_('undefined is not valid json', 'undefined');

  // These numbers cannot be represented in JSON
  error_('NaN cannot be presented in JSON', 'NaN');
  error_('Infinity cannot be presented in JSON', 'Infinity');
  error_('-Infinity cannot be presented in JSON', '-Infinity');
}

function testIsNotValid() {
  assertFalse(goog.window.JSON.isValid('t'));
  assertFalse(goog.window.JSON.isValid('r'));
  assertFalse(goog.window.JSON.isValid('u'));
  assertFalse(goog.window.JSON.isValid('e'));
  assertFalse(goog.window.JSON.isValid('f'));
  assertFalse(goog.window.JSON.isValid('a'));
  assertFalse(goog.window.JSON.isValid('l'));
  assertFalse(goog.window.JSON.isValid('s'));
  assertFalse(goog.window.JSON.isValid('n'));
  assertFalse(goog.window.JSON.isValid('E'));

  assertFalse(goog.window.JSON.isValid('+'));
  assertFalse(goog.window.JSON.isValid('-'));

  assertFalse(goog.window.JSON.isValid('t++'));
  assertFalse(goog.window.JSON.isValid('++t'));
  assertFalse(goog.window.JSON.isValid('t--'));
  assertFalse(goog.window.JSON.isValid('--t'));
  assertFalse(goog.window.JSON.isValid('-t'));
  assertFalse(goog.window.JSON.isValid('+t'));

  assertFalse(goog.window.JSON.isValid('"\\"'));  // "\"
  assertFalse(goog.window.JSON.isValid('"\\'));   // "\

  // multiline string using \ at the end is not valid
  assertFalse(goog.window.JSON.isValid('"a\\\nb"'));


  assertFalse(goog.window.JSON.isValid('"\n"'));
  assertFalse(goog.window.JSON.isValid('"\r"'));
  assertFalse(goog.window.JSON.isValid('"\r\n"'));
  // Disallow the unicode newlines
  assertFalse(goog.window.JSON.isValid('"\u2028"'));
  assertFalse(goog.window.JSON.isValid('"\u2029"'));

  assertFalse(goog.window.JSON.isValid(' '));
  assertFalse(goog.window.JSON.isValid('\n'));
  assertFalse(goog.window.JSON.isValid('\r'));
  assertFalse(goog.window.JSON.isValid('\r\n'));

  assertFalse(goog.window.JSON.isValid('t.r'));

  assertFalse(goog.window.JSON.isValid('1e'));
  assertFalse(goog.window.JSON.isValid('1e-'));
  assertFalse(goog.window.JSON.isValid('1e+'));

  assertFalse(goog.window.JSON.isValid('1e-'));

  assertFalse(goog.window.JSON.isValid('"\\\u200D\\"'));
  assertFalse(goog.window.JSON.isValid('"\\\0\\"'));
  assertFalse(goog.window.JSON.isValid('"\\\0"'));
  assertFalse(goog.window.JSON.isValid('"\\0"'));
  assertFalse(goog.window.JSON.isValid('"\x0c"'));

  assertFalse(goog.window.JSON.isValid('"\\\u200D\\", alert(\'foo\') //"\n'));

  // Disallow referencing variables with names built up from primitives
  assertFalse(goog.window.JSON.isValid('truefalse'));
  assertFalse(goog.window.JSON.isValid('null0'));
  assertFalse(goog.window.JSON.isValid('null0.null0'));
  assertFalse(goog.window.JSON.isValid('[truefalse]'));
  assertFalse(goog.window.JSON.isValid('{"a": null0}'));
  assertFalse(goog.window.JSON.isValid('{"a": null0, "b": 1}'));
}

function testIsValid() {
  assertTrue(goog.window.JSON.isValid('\n""\n'));
  assertTrue(goog.window.JSON.isValid('[1\n,2\r,3\u2028\n,4\u2029]'));
  assertTrue(goog.window.JSON.isValid('"\x7f"'));
  assertTrue(goog.window.JSON.isValid('"\x09"'));
  // Test tab characters in window.JSON.
  assertTrue(goog.window.JSON.isValid('{"\t":"\t"}'));
}

function testDoNotSerializeProto() {
  function F(){};
  F.prototype = {c: 3};

  var obj = new F;
  obj.a = 1;
  obj.b = 2;

  assertEquals(
      'Should not follow the prototype chain', '{"a":1,"b":2}',
      goog.window.JSON.serialize(obj));
}

function testEscape() {
  var unescaped = '1a*/]';
  assertEquals(
      'Should not escape', '"' + unescaped + '"',
      goog.window.JSON.serialize(unescaped));

  var escaped = '\n\x7f\u1049';
  assertEquals(
      'Should escape', '',
      findCommonChar(escaped, goog.window.JSON.serialize(escaped)));
  assertEquals(
      'Should eval to the same string after escaping', escaped,
      goog.window.JSON.parse(goog.window.JSON.serialize(escaped)));
}

function testReplacer() {
  assertSerialize('[null,null,0]', [, , 0]);

  assertSerialize('[0,0,{"x":0}]', [, , {x: 0}], function(k, v) {
    if (v === undefined && goog.isArray(this)) {
      return 0;
    }
    return v;
  });

  assertSerialize('[0,1,2,3]', [0, 0, 0, 0], function(k, v) {
    var kNum = Number(k);
    if (k && !isNaN(kNum)) {
      return kNum;
    }
    return v;
  });

  var f = function(k, v) { return typeof v == 'number' ? v + 1 : v; };
  assertSerialize('{"a":1,"b":{"c":2}}', {'a': 0, 'b': {'c': 1}}, f);
}

function testDateSerialize() {
  assertSerialize('{}', new Date(0));
}

function testToJSONSerialize() {
  assertSerialize('{}', {toJSON: goog.functions.constant('serialized')});
  assertSerialize('{"toJSON":"normal"}', {toJSON: 'normal'});
}


function testTryNativeJson() {
  goog.window.JSON.TRY_NATIVE_JSON = true;
  var error;
  goog.window.JSON.setErrorLogger(function(message, ex) {
    error = message;
  });

  error = undefined;
  goog.window.JSON.parse('{"a":[,1]}');
  assertEquals('Invalid JSON: {"a":[,1]}', error);

  goog.window.JSON.TRY_NATIVE_JSON = false;
  goog.window.JSON.setErrorLogger(goog.nullFunction);
}


/**
 * Asserts that the given object serializes to the given value.
 * If the current browser has an implementation of window.JSON.serialize,
 * we make sure our version matches that one.
 */
function assertSerialize(expected, obj, opt_replacer) {
  assertEquals(expected, goog.window.JSON.serialize(obj, opt_replacer));

  // goog.window.JSON.serialize escapes non-ASCI characters while window.JSON.stringify
  // doesn’t.  This is expected so do not compare the results.
  if (typeof obj == 'string' && obj.charCodeAt(0) > 0x7f) return;

  // I'm pretty sure that the goog.window.JSON.serialize behavior is correct by the ES5
  // spec, but window.JSON.stringify(undefined) is undefined on all browsers.
  if (obj === undefined) return;

  // Browsers don't serialize undefined properties, but goog.window.JSON.serialize does
  if (goog.isObject(obj) && ('a' in obj) && obj['a'] === undefined) return;

  // Replacers are broken on IE and older versions of firefox.
  if (opt_replacer && !goog.userAgent.WEBKIT) return;

  // goog.window.JSON.serialize does not stringify dates the same way.
  if (obj instanceof Date) return;

  // goog.window.JSON.serialize does not stringify functions the same way.
  if (obj instanceof Function) return;

  // goog.window.JSON.serialize doesn't use the toJSON method.
  if (goog.isObject(obj) && goog.isFunction(obj.toJSON)) return;

  if (typeof JSON != 'undefined') {
    assertEquals(
        'goog.window.JSON.serialize does not match window.JSON.stringify', expected,
        window.JSON.stringify(obj, opt_replacer));
  }
}


/**
 * @param {string} a
 * @param {string} b
 * @return {string} any common character between two strings a and b.
 */
function findCommonChar(a, b) {
  for (var i = 0; i < b.length; i++) {
    if (a.indexOf(b.charAt(i)) >= 0) {
      return b.charAt(i);
    }
  }
  return '';
}
