import { bloomBus } from '@koru/bloomcore';

export class BloomLink {
    constructor() {
        console.log('[BloomLink] Initialized hardware abstraction layer.');
    }

    public start() {
        console.log('[BloomLink] Bridging hardware events...');
        
        // Example: simulate hardware sending a tilt event to the Core Event Bus
        setInterval(() => {
            bloomBus.publish('HARDWARE_TILT', { axis: 'x', degrees: 45 }, 'BloomLink');
        }, 20000);
    }
}

export const link = new BloomLink();
