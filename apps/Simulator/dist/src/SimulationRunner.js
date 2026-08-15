import { EmotionEngine, EmotionRules, AnimationState, DEFAULT_EMOTION_STATE } from '@koru/bloomemotion';
// Mock EventBus and Logger for standalone simulation
class MockLogger {
    info(tag, msg) { console.log(`[INFO] [${tag}] ${msg}`); }
    debug(tag, msg) { void tag; void msg; /* console.log(`[DEBUG] [${tag}] ${msg}`); */ }
    warn(tag, msg) { console.warn(`[WARN] [${tag}] ${msg}`); }
    error(tag, msg) { console.error(`[ERROR] [${tag}] ${msg}`); }
}
class MockEventBus {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handlers = new Map();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    subscribe(event, handler) {
        if (!this.handlers.has(event))
            this.handlers.set(event, []);
        this.handlers.get(event).push(handler);
        return () => { };
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    publish(event, payload) {
        console.log(`\n[EVENT BUS] Fired: ${event}`, payload);
        const eventHandlers = this.handlers.get(event) || [];
        eventHandlers.forEach(h => h(payload));
    }
}
async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function runSimulation() {
    console.log("==========================================");
    console.log(" KORU BLOOM_EMOTION SIMULATOR ");
    console.log("==========================================\n");
    const bus = new MockEventBus();
    const logger = new MockLogger();
    const rules = new EmotionRules();
    const anims = new AnimationState();
    // --- Setup Rules (Matching Spec) ---
    rules.registerRule('HARDWARE:BATTERY_UPDATED', (payload) => {
        if (payload.level < 15)
            return { Energy: -30, Stress: +20, Sleepiness: +40 };
        return {};
    });
    rules.registerRule('PLANT:HEALTH_UPDATED', (payload) => {
        if (payload.status === 'unhealthy')
            return { PlantConcern: +50, Stress: +30 };
        return {};
    });
    rules.registerRule('USER:INTERACTION', () => {
        return { Friendship: +20, Stress: -20 };
    });
    // --- Setup Animations (Matching Priority) ---
    anims.registerAnimation('SLEEP', 1, (s) => s.Sleepiness > 80);
    anims.registerAnimation('CRY', 2, (s) => s.Stress > 80);
    anims.registerAnimation('UNCOMFORTABLE', 3, (s) => s.PlantConcern > 70 || s.Stress > 60);
    anims.registerAnimation('LOVE', 4, (s) => s.Friendship > 80 && s.Stress < 30);
    // Blink is default fallback
    // Initialize Engine
    new EmotionEngine(bus, logger, rules, anims, DEFAULT_EMOTION_STATE);
    // --- Run Scenarios ---
    console.log("\n--- SCENARIO 1: Idle Normal (Battery 100, Plant Healthy) ---");
    bus.publish('HARDWARE:BATTERY_UPDATED', { level: 100 });
    // Engine defaults to BLINK
    await sleep(1000);
    console.log("\n--- SCENARIO 2: Low Battery ---");
    bus.publish('HARDWARE:BATTERY_UPDATED', { level: 10 });
    // Should trigger SLEEP
    await sleep(1000);
    // Reset state via a simulated reboot for scenario 3
    console.log("\n--- SCENARIO 3: Plant Distress ---");
    bus.publish('PLANT:HEALTH_UPDATED', { status: 'unhealthy' });
    // Should trigger UNCOMFORTABLE
    await sleep(1000);
    console.log("\n--- SCENARIO 4: User Interacts Repeatedly ---");
    bus.publish('USER:INTERACTION', {});
    bus.publish('USER:INTERACTION', {});
    bus.publish('USER:INTERACTION', {});
    // Should drop stress and raise friendship -> LOVE
    await sleep(1000);
    console.log("\n--- SCENARIO 5: Isolation Decay (Time Ticks) ---");
    for (let i = 0; i < 5; i++) {
        bus.publish('SYSTEM:TIME_TICK', {});
        await sleep(200);
    }
    // Friendship should decay, Loneliness should rise, animation falls back to BLINK eventually.
    console.log("\n==========================================");
    console.log(" SIMULATION COMPLETE ");
    console.log("==========================================");
}
runSimulation();
//# sourceMappingURL=SimulationRunner.js.map