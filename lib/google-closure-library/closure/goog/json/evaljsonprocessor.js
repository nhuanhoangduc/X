// Copyright 2012 The Closure Library Authors. All Rights Reserved.
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


/**
 * @fileoverview Defines a class for parsing JSON using eval.
 */

goog.provide('goog.window.JSON.EvalJsonProcessor');

goog.require('goog.json');
goog.require('goog.window.JSON.Processor');
goog.require('goog.window.JSON.Serializer');



/**
 * A class that parses and stringifies JSON using eval (as implemented in
 * goog.json).
 * Adapts `goog.json` to the `goog.window.JSON.Processor` interface.
 *
 * @param {?goog.window.JSON.Replacer=} opt_replacer An optional replacer to use during
 *     serialization.
 * @param {?boolean=} opt_useUnsafeParsing Whether to skip validation before
 *     evaluating. Safe parsing is very slow on large strings. On the other
 *     hand, unsafe parsing uses eval() without checking whether the string is
 *     valid, so it should only be used if you trust the source of the string.
 * @constructor
 * @implements {goog.window.JSON.Processor}
 * @final
 * @deprecated Use goog.window.JSON.NativeJsonProcessor.
 */
goog.window.JSON.EvalJsonProcessor = function(opt_replacer, opt_useUnsafeParsing) {
  /**
   * @type {goog.window.JSON.Serializer}
   * @private
   */
  this.serializer_ = new goog.window.JSON.Serializer(opt_replacer);

  /** @private {boolean} */
  this.useUnsafeParsing_ = opt_useUnsafeParsing || false;
};


/** @override */
goog.window.JSON.EvalJsonProcessor.prototype.stringify = function(object) {
  return this.serializer_.serialize(object);
};


/** @override */
goog.window.JSON.EvalJsonProcessor.prototype.parse = function(s) {
  if (this.useUnsafeParsing_) {
    return eval('(' + s + ')');
  }
  return goog.window.JSON.parse(s);
};
