import assert from "node:assert/strict";
import {
  haversineKm,
  summarizeProximity,
  shareText,
  formatDistance
} from "../proximity.js";

const origin = { lat: 38.4237, lng: 27.1428 };
const byKind = {
  duty_pharmacy: [
    { name: "A", lat: 38.4240, lng: 27.1430 },
    { name: "B", lat: 38.4500, lng: 27.1800 }
  ],
  pharmacy: [{ name: "C", lat: 38.4245, lng: 27.1435 }],
  hospital: [{ name: "D", lat: 38.4300, lng: 27.1500 }],
  market: [{ name: "E", lat: 38.4238, lng: 27.1429 }],
  assembly: [
    { name: "F", lat: 38.4250, lng: 27.1440 },
    { name: "G", lat: 38.5000, lng: 27.2000 }
  ]
};

assert.ok(haversineKm(origin, origin) < 0.000001);
const summary = summarizeProximity(byKind, origin, 1000);
assert.equal(summary.counts.duty_pharmacy, 1);
assert.equal(summary.counts.pharmacy, 1);
assert.equal(summary.counts.market, 1);
assert.equal(summary.counts.assembly, 1);
assert.equal(summary.nearest.duty_pharmacy.name, "A");
assert.match(shareText(summary), /1 km çevremde/);
assert.match(shareText(summary), /#İzmirYakınımda/);
assert.equal(formatDistance(0.42), "420 m");
assert.equal(formatDistance(2.25), "2.3 km");

assert.throws(() => summarizeProximity(byKind, {}, 1000), /origin/);
assert.throws(() => summarizeProximity(byKind, origin, 0), /positive/);

console.log("PASS proximity summary");
console.log("PASS privacy-safe share text");
console.log("PROXIMITY TEST PASS");
