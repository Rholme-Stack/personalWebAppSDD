import { ViewportScroller } from '@angular/common';
import { Component, ElementRef, computed, inject, model, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../i18n/language.service';
import { LANGS, Lang } from '../../i18n/translations';
import { LINKEDIN, PROFILE } from '../profile';

@Component({
  selector: 'app-site-header',
  imports: [RouterLink],
  styleUrl: './site-header.css',
  templateUrl: './site-header.html',
  host: {
    '[class.menu-open]': 'menuOpen()',
    '(document:keydown.escape)': 'onEscape($event)',
  },
})
export class SiteHeader {
  /** Two-way, so the page behind can be made inert while the menu is open. */
  readonly menuOpen = model(false);

  private readonly language = inject(LanguageService);
  private readonly scroller = inject(ViewportScroller);
  private readonly menuButton = viewChild.required<ElementRef<HTMLElement>>('menuButton');

  protected readonly t = this.language.t;
  protected readonly lang = this.language.lang;
  protected readonly langs = LANGS;
  protected readonly langCode = computed(
    () => LANGS.find((option) => option.value === this.lang())!.code,
  );
  protected readonly name = PROFILE.name;
  protected readonly linkedin = LINKEDIN;

  constructor() {
    // The router jumps to sections with window.scrollTo, which would leave the title under the header.
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    this.scroller.setOffset(() => [0, host.offsetHeight]);
  }

  /** The router does not scroll when there is no fragment, so the logo does it. */
  protected goToTop(): void {
    this.closeMenu();
    this.scroller.scrollToPosition([0, 0]);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  protected onEscape(event: Event): void {
    if (!this.menuOpen() || isOpenDropdown(event.target)) {
      return;
    }
    this.closeMenu();
    this.menuButton().nativeElement.focus({ preventScroll: true });
  }

  protected onLangChange(event: Event): void {
    this.language.setLang((event.target as HTMLSelectElement).value as Lang);
  }
}

/**
 * A browser may also send to the page the Escape that closes a select dropdown.
 * Inside :is(), browsers that do not know :open ignore it instead of throwing.
 */
function isOpenDropdown(target: EventTarget | null): boolean {
  return target instanceof HTMLSelectElement && target.matches(':is(:open)');
}
