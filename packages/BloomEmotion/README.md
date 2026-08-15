# BloomEmotion

**BloomEmotion** is the psychological state engine for Project Koru. It is **not** an animation controller. It continuously evaluates Koru's internal emotional state based on stimuli received from the `BloomCore` Event Bus, and publishes the resulting dominant emotional expression.

## Architecture Diagram

```mermaid
graph TD
    EB[BloomCore Event Bus] -->|SYSTEM:TIME_TICK| ED[EmotionDecay]
    EB -->|HARDWARE:BATTERY_UPDATED| ER[EmotionRules]
    EB -->|VISION:FACE_DETECTED| ER
    
    ER -->|Calculates Deltas| EC[EmotionCalculator]
    ED -->|Calculates Drifts| EC
    
    EC -->|Updates| ES[(EmotionState 0-100)]
    
    ES -->|Evaluates against| AS[AnimationState Priority List]
    
    AS -->|Returns Dominant Animation| EE[EmotionEngine]
    EE -->|Publishes EMOTION:ANIMATION_CHANGED| EB
```

## UML Class Diagram

```mermaid
classDiagram
    class EmotionEngine {
      -state: EmotionState
      -currentAnimation: string
      +constructor(eventBus, logger, rules, animationState)
      -setupSubscriptions()
      -applyRules(event, payload)
      -evaluateState()
      +getState()
    }
    
    class EmotionState {
      <<type>>
      +Energy: number
      +Stress: number
      +Friendship: number
      +Curiosity: number
      +Sleepiness: number
      +...
    }
    
    class EmotionRules {
      -rules: Map
      +registerRule(event, evaluator)
      +evaluateRules(event, payload)
    }
    
    class EmotionDecay {
      +applyDecay(currentState): EmotionState
    }
    
    class EmotionCalculator {
      +applyDeltas(currentState, deltas): EmotionState
      -clamp(value)
    }
    
    class AnimationState {
      -animations: AnimationDefinition[]
      +registerAnimation(name, priority, evaluate)
      +getDominantAnimation(state): string
    }

    EmotionEngine --> EmotionState
    EmotionEngine --> EmotionRules
    EmotionEngine --> AnimationState
    EmotionEngine --> EmotionDecay
    EmotionDecay ..> EmotionCalculator
    EmotionRules ..> EmotionCalculator
```

## Sequence Diagram

```mermaid
sequenceDiagram
    participant Hardware
    participant EventBus
    participant EmotionEngine
    participant EmotionRules
    participant AnimationState
    participant BloomFace

    Hardware->>EventBus: Publish HARDWARE:BATTERY_UPDATED (10%)
    EventBus->>EmotionEngine: Trigger Callback
    EmotionEngine->>EmotionRules: evaluateRules(payload)
    EmotionRules-->>EmotionEngine: Return {Energy: -30, Sleepiness: +40}
    EmotionEngine->>EmotionEngine: Update EmotionState
    EmotionEngine->>AnimationState: getDominantAnimation(state)
    AnimationState-->>EmotionEngine: Return 'SLEEP'
    EmotionEngine->>EventBus: Publish EMOTION:ANIMATION_CHANGED ('SLEEP')
    EventBus->>BloomFace: Trigger UI Update
```

## How To Guides

### Adding a New Emotion Variable
1. Open `EmotionState.ts`.
2. Add the key to `EmotionKey` (e.g. `'Angry'`).
3. Add a default value to `DEFAULT_EMOTION_STATE`.

### Adding a New Rule
Rules define how Koru reacts to the world.
In your setup script:
```typescript
rules.registerRule('USER:HIT', () => {
  return { Stress: +50, Friendship: -20, Angry: +80 };
});
```

### Adding a New Animation
Animations evaluate the current state. There are no direct triggers.
```typescript
anims.registerAnimation('ANGRY_FACE', 2, (state) => state.Angry > 80 && state.Stress > 50);
```
Priority `1` is the highest. If multiple animations evaluate to `true`, the highest priority wins.
