import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TypedRole } from './typed-role';

const TEXT = 'Dev full';

describe('TypedRole', () => {
  let fixture: ComponentFixture<TypedRole>;
  let compiled: HTMLElement;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  function render(text = TEXT) {
    fixture = TestBed.createComponent(TypedRole);
    fixture.componentRef.setInput('text', text);
    fixture.detectChanges();
    compiled = fixture.nativeElement as HTMLElement;
  }

  /** Advances the clock in small steps, rendering after each one, like a browser would. */
  function advance(ms: number) {
    for (let elapsed = 0; elapsed < ms; elapsed += 5) {
      vi.advanceTimersByTime(5);
      fixture.detectChanges();
    }
  }

  function advanceUntil(done: () => boolean) {
    for (let elapsed = 0; elapsed < 20_000; elapsed += 5) {
      if (done()) {
        return;
      }
      advance(5);
    }
    throw new Error('The expected state never came');
  }

  function animated() {
    return compiled.querySelector('[aria-hidden="true"]');
  }

  function visible() {
    return animated()?.textContent ?? '';
  }

  function cursor() {
    return compiled.querySelector('.cursor');
  }

  function stubReducedMotion(reduced: boolean) {
    const listeners = new Set<() => void>();
    const list = {
      matches: reduced,
      addEventListener: (_type: string, listener: () => void) => listeners.add(listener),
      removeEventListener: (_type: string, listener: () => void) => listeners.delete(listener),
    };
    vi.stubGlobal('matchMedia', () => list);
    return {
      listeners,
      change(value: boolean) {
        list.matches = value;
        listeners.forEach((listener) => listener());
        fixture.detectChanges();
      },
    };
  }

  it('should start empty, with a cursor', () => {
    render();
    expect(visible()).toBe('');
    expect(cursor()).not.toBeNull();
  });

  it('should write the text letter by letter, spaces included', () => {
    render();
    const seen = [visible()];
    advanceUntil(() => {
      if (visible() !== seen.at(-1)) {
        seen.push(visible());
      }
      return visible() === TEXT;
    });
    expect(seen).toEqual(['', 'D', 'De', 'Dev', 'Dev ', 'Dev f', 'Dev fu', 'Dev ful', 'Dev full']);
  });

  it('should keep the whole text for 3 seconds and then delete it letter by letter', () => {
    render();
    advanceUntil(() => visible() === TEXT);
    advance(2990);
    expect(visible()).toBe(TEXT);

    advance(10);
    const seen = [visible()];
    advanceUntil(() => {
      if (visible() !== seen.at(-1)) {
        seen.push(visible());
      }
      return visible() === '';
    });
    expect(seen).toEqual(['Dev ful', 'Dev fu', 'Dev f', 'Dev ', 'Dev', 'De', 'D', '']);
  });

  it('should write the text again after deleting it', () => {
    render();
    advanceUntil(() => visible() === TEXT);
    advanceUntil(() => visible() === '');
    advance(1000);
    expect(visible()).not.toBe('');
    advanceUntil(() => visible() === TEXT);
  });

  it('should keep the cursor right after the last letter', () => {
    render();
    advanceUntil(() => visible() === 'Dev ');
    expect(animated()?.lastElementChild).toBe(cursor());
    expect(cursor()?.previousSibling?.textContent).toBe('Dev ');
    expect(cursor()?.textContent).toBe('');
  });

  it('should blink only while the text is still', () => {
    render();
    const blinks = () => cursor()?.classList.contains('blink');
    expect(blinks()).toBe(true);
    advanceUntil(() => visible() === 'De');
    expect(blinks()).toBe(false);
    advanceUntil(() => visible() === TEXT);
    expect(blinks()).toBe(true);
    advanceUntil(() => visible() === 'De');
    expect(blinks()).toBe(false);
  });

  it('should always give screen readers the whole text, and nothing else', () => {
    render();
    const spoken = () => {
      const copy = compiled.cloneNode(true) as HTMLElement;
      copy.querySelectorAll('[aria-hidden="true"]').forEach((element) => element.remove());
      return copy.textContent?.trim();
    };
    expect(spoken()).toBe(TEXT);
    advanceUntil(() => visible() === 'De');
    expect(spoken()).toBe(TEXT);
    expect(compiled.querySelector('[aria-live], [role="status"]')).toBeNull();
  });

  it('should start again with the new text when the text changes', () => {
    render();
    advanceUntil(() => visible() === 'Dev f');
    fixture.componentRef.setInput('text', 'Program');
    fixture.detectChanges();
    expect(visible()).toBe('');
    advanceUntil(() => visible() === 'Pr');
    advanceUntil(() => visible() === 'Program');
  });

  describe('with reduced motion', () => {
    it('should show the whole text still and without a cursor', () => {
      stubReducedMotion(true);
      render();
      expect(compiled.textContent?.trim()).toBe(TEXT);
      expect(cursor()).toBeNull();
      expect(vi.getTimerCount()).toBe(0);
    });

    it('should react when the preference changes', () => {
      const media = stubReducedMotion(false);
      render();
      advanceUntil(() => visible() === 'De');

      media.change(true);
      expect(compiled.textContent?.trim()).toBe(TEXT);
      expect(cursor()).toBeNull();
      advance(5000);
      expect(compiled.textContent?.trim()).toBe(TEXT);

      media.change(false);
      expect(visible()).toBe('');
      advanceUntil(() => visible() === TEXT);
    });
  });

  it('should leave no timer or listener behind when it is destroyed', () => {
    const media = stubReducedMotion(false);
    render();
    advanceUntil(() => visible() === 'De');
    fixture.destroy();
    expect(vi.getTimerCount()).toBe(0);
    expect(media.listeners.size).toBe(0);
  });
});
