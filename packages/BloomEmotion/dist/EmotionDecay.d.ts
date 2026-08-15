import { EmotionState } from './EmotionState';
export declare class EmotionDecay {
    /**
     * Applies the natural time decay to the state.
     */
    static applyDecay(currentState: EmotionState): EmotionState;
}
