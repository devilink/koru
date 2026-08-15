"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.link = exports.BloomLink = void 0;
const bloomcore_1 = require("@koru/bloomcore");
class BloomLink {
    constructor() {
        console.log('[BloomLink] Initialized hardware abstraction layer.');
    }
    start() {
        console.log('[BloomLink] Bridging hardware events...');
        // Example: simulate hardware sending a tilt event to the Core Event Bus
        setInterval(() => {
            bloomcore_1.bloomBus.publish('HARDWARE_TILT', { axis: 'x', degrees: 45 }, 'BloomLink');
        }, 20000);
    }
}
exports.BloomLink = BloomLink;
exports.link = new BloomLink();
