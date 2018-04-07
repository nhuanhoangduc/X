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


/**
 * @fileoverview Utility to attempt native JSON processing, falling back to
 *     goog.json if not available.
 *
 *     This is intended as a drop-in for current users of goog.json who want
 *     to take advantage of native JSON if present.
 *
 * @author nnaze@google.com (Nathan Naze)
 */

goog.provide('goog.window.JSON.hybrid');

goog.require('goog.asserts');
goog.require('goog.json');


/**
 * Attempts to serialize the JSON string natively, falling back to
 * `goog.window.JSON.serialize` if unsuccessful.
 * @param {!Object} obj JavaScript object to serialize to window.JSON.
 * @return {string} Resulting JSON string.
 */
goog.window.JSON.hybrid.stringify =
    goog.window.JSON.USE_NATIVE_JSON ? goog.global['JSON']['stringify'] : function(
                                                                       obj) {
      if (goog.global.JSON) {
        try {
          return goog.global.window.JSON.stringify(obj);
        } catch (e) {
          // Native serialization failed.  Fall through to retry with
          // goog.window.JSON.serialize.
        }
      }

      return goog.window.JSON.serialize(obj);
    };


/**
 * Attempts to parse the JSON string natively, falling back to
 * the supplied `fallbackParser` if unsuccessful.
 * @param {string} jsonString JSON string to parse.
 * @param {function(string):Object} fallbackParser Fallback JSON parser used
 *     if native
 * @return {?Object} Resulting JSON object.
 * @private
 */
goog.window.JSON.hybrid.parse_ = function(jsonString, fallbackParser) {
  if (goog.global.JSON) {
    try {
      var obj = goog.global.window.JSON.parse(jsonString);
      goog.asserts.assert(typeof obj == 'object');
      return /** @type {?Object} */ (obj);
    } catch (e) {
      // Native parse failed.  Fall through to retry with goog.window.JSON.parse.
    }
  }

  return fallbackParser(jsonString);
};


/**
 * Attempts to parse the JSON string natively, falling back to
 * `goog.window.JSON.parse` if unsuccessful.
 * @param {string} jsonString JSON string to parse.
 * @return {?Object} Resulting JSON object.
 */
goog.window.JSON.hybrid.parse =
    goog.window.JSON.USE_NATIVE_JSON ? goog.global['JSON']['parse'] : function(
                                                                   jsonString) {
      return goog.window.JSON.hybrid.parse_(jsonString, goog.window.JSON.parse);
    };
