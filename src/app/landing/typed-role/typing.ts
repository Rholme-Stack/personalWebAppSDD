/** A point of the cycle: how many letters are visible and which way it is going. */
export interface TypingState {
  readonly length: number;
  readonly deleting: boolean;
}

export const START: TypingState = { length: 0, deleting: false };

const EMPTY_MS = 700;
const COMPLETE_MS = 3000;
const LETTER_MIN_MS = 70;
const LETTER_MAX_MS = 190;
/** A person hesitates a little before starting another word. */
const NEW_WORD_MS = 150;
const DELETE_MS = 45;

/** Writes up to the whole text, deletes it down to nothing, and starts again. */
export function nextStep(state: TypingState, text: string): TypingState {
  if (state.length === 0) {
    return { length: Math.min(1, text.length), deleting: false };
  }
  const deleting = state.deleting || state.length >= text.length;
  return { length: state.length + (deleting ? -1 : 1), deleting };
}

/** Milliseconds to wait before the next step. `random` (0 to 1) makes the rhythm irregular. */
export function stepDelay(state: TypingState, text: string, random: number): number {
  if (state.length === 0) {
    return EMPTY_MS;
  }
  if (state.deleting) {
    return DELETE_MS;
  }
  if (state.length >= text.length) {
    return COMPLETE_MS;
  }
  const letter = LETTER_MIN_MS + random * (LETTER_MAX_MS - LETTER_MIN_MS);
  return text[state.length - 1] === ' ' ? letter + NEW_WORD_MS : letter;
}

/** Nothing is being written or deleted: the text is empty or complete. */
export function isIdle(state: TypingState, text: string): boolean {
  return state.length === 0 || state.length >= text.length;
}
