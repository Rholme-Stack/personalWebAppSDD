import { START, TypingState, isIdle, nextStep, stepDelay } from './typing';

const TEXT = 'ab cd';

describe('typing', () => {
  describe('nextStep', () => {
    it('should write letter by letter, delete letter by letter and start again', () => {
      const lengths: number[] = [];
      let state: TypingState = START;
      for (let i = 0; i < 12; i++) {
        lengths.push(state.length);
        state = nextStep(state, TEXT);
      }
      expect(lengths).toEqual([0, 1, 2, 3, 4, 5, 4, 3, 2, 1, 0, 1]);
    });

    it('should stay empty when there is nothing to write', () => {
      expect(nextStep(START, '').length).toBe(0);
    });
  });

  describe('stepDelay', () => {
    it('should keep the whole text for 3 seconds', () => {
      const complete = { length: TEXT.length, deleting: false };
      expect(stepDelay(complete, TEXT, 0)).toBe(3000);
      expect(stepDelay(complete, TEXT, 1)).toBe(3000);
    });

    it('should stay empty for less than a second', () => {
      for (const empty of [START, { length: 0, deleting: true }]) {
        expect(stepDelay(empty, TEXT, 1)).toBeGreaterThan(0);
        expect(stepDelay(empty, TEXT, 1)).toBeLessThan(1000);
      }
    });

    it('should write with an irregular rhythm', () => {
      const writing = { length: 1, deleting: false };
      const delays = [0, 0.25, 0.5, 0.75, 1].map((random) => stepDelay(writing, TEXT, random));
      expect(new Set(delays).size).toBe(5);
      expect(Math.min(...delays)).toBe(70);
      expect(Math.max(...delays)).toBe(190);
    });

    it('should hesitate before a new word', () => {
      const afterSpace = { length: 3, deleting: false };
      const insideWord = { length: 4, deleting: false };
      expect(stepDelay(afterSpace, TEXT, 0.5)).toBeGreaterThan(stepDelay(insideWord, TEXT, 0.5));
    });

    it('should delete faster than the fastest letter written', () => {
      const deleting = { length: 3, deleting: true };
      const writing = { length: 1, deleting: false };
      expect(stepDelay(deleting, TEXT, 1)).toBeLessThan(stepDelay(writing, TEXT, 0));
    });
  });

  describe('isIdle', () => {
    it('should be idle only when the text is empty or complete', () => {
      expect(isIdle(START, TEXT)).toBe(true);
      expect(isIdle({ length: 5, deleting: false }, TEXT)).toBe(true);
      expect(isIdle({ length: 0, deleting: true }, TEXT)).toBe(true);
      expect(isIdle({ length: 2, deleting: false }, TEXT)).toBe(false);
      expect(isIdle({ length: 2, deleting: true }, TEXT)).toBe(false);
    });
  });
});
