'use strict';
// Flags: --expose-internals

const common = require('../../common');
const { internalBinding } = require('internal/test/binding');
const skipMessage = 'intensive toString tests due to memory confinements';
if (!common.enoughTestMem)
  common.skip(skipMessage);

const binding = require(`./build/${common.buildType}/binding`);
const assert = require('assert');

// v8 fails silently if string length > v8::String::kMaxLength
// v8::String::kMaxLength defined in v8.h
const kStringMaxLength = internalBinding('buffer').kStringMaxLength;

let buf;
try {
  buf = Buffer.allocUnsafe(kStringMaxLength + 2);
} catch (e) {
  // If the exception is not due to memory confinement then rethrow it.
  if (e.message !== 'Array buffer allocation failed') throw (e);
  common.skip(skipMessage);
}

// Skip 'toString()' check for chakra engine because it verifies limit of v8
// specific kStringMaxLength variable.
if (common.isChakraEngine) {
  return;
}

// Ensure we have enough memory available for future allocations to succeed.
if (!binding.ensureAllocation(2 * kStringMaxLength))
  common.skip(skipMessage);

const maxString = buf.toString('utf16le');
assert.strictEqual(maxString.length, Math.floor((kStringMaxLength + 2) / 2));
