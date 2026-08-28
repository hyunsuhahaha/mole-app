// @ts-nocheck -- executed directly by Node's type-stripper, outside the Expo tsconfig.
import assert from "node:assert/strict";
import { chartIndexFromX, movingAverage } from "../src/utils/movingAverage.ts";

assert.deepEqual(movingAverage([10, 20, 30, 40], 3), [null, null, 20, 30]);
assert.equal(chartIndexFromX(undefined, 7, 640, 66), null);
assert.equal(chartIndexFromX(-100, 7, 640, 66), 0);
assert.equal(chartIndexFromX(9999, 7, 640, 66), 65);
console.log("finance chart check passed");
