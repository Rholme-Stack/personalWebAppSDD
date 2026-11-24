import {
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  signal,
} from '@angular/core';
import { START, TypingState, isIdle, nextStep, stepDelay } from './typing';

/** Writes and deletes a text in a loop, as if a person were typing it (feature 006). */
@Component({
  selector: 'app-typed-role',
  styleUrl: './typed-role.css',
  templateUrl: './typed-role.html',
})
export class TypedRole {
  readonly text = input.required<string>();

  protected readonly reducedMotion = signal(false);

  /** Goes back to the start whenever the text or the motion preference changes. */
  private readonly state = linkedSignal<unknown, TypingState>({
    source: () => [this.text(), this.reducedMotion()],
    computation: () => START,
  });

  protected readonly visible = computed(() => this.text().slice(0, this.state().length));
  protected readonly idle = computed(() => isIdle(this.state(), this.text()));

  constructor() {
    this.watchReducedMotion();

    effect((onCleanup) => {
      if (this.reducedMotion()) {
        return;
      }
      const timer = setTimeout(
        () => this.state.update((state) => nextStep(state, this.text())),
        stepDelay(this.state(), this.text(), Math.random()),
      );
      onCleanup(() => clearTimeout(timer));
    });
  }

  private watchReducedMotion(): void {
    const query = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!query) {
      return;
    }
    const update = () => this.reducedMotion.set(query.matches);
    update();
    query.addEventListener('change', update);
    inject(DestroyRef).onDestroy(() => query.removeEventListener('change', update));
  }
}
