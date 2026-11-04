import { DOCUMENT, Injectable, computed, inject, signal } from '@angular/core';
import { LANGS, Lang, TRANSLATIONS } from './translations';

const STORAGE_KEY = 'lang';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly document = inject(DOCUMENT);
  private readonly current = signal<Lang>(this.initialLang());

  readonly lang = this.current.asReadonly();
  readonly t = computed(() => TRANSLATIONS[this.current()]);

  constructor() {
    this.document.documentElement.lang = this.current();
  }

  setLang(lang: Lang): void {
    this.current.set(lang);
    this.document.documentElement.lang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Storage blocked: the choice only lasts for this visit.
    }
  }

  private initialLang(): Lang {
    const saved = readSaved();
    if (saved) {
      return saved;
    }
    for (const browserLang of navigator.languages ?? []) {
      const match = fromBrowserLang(browserLang);
      if (match) {
        return match;
      }
    }
    return 'en';
  }
}

function readSaved(): Lang | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return LANGS.some((l) => l.value === value) ? (value as Lang) : null;
  } catch {
    return null;
  }
}

function fromBrowserLang(browserLang: string): Lang | null {
  const base = browserLang.toLowerCase().split('-')[0];
  if (base === 'es') return 'es';
  if (base === 'pt') return 'pt-BR';
  if (base === 'en') return 'en';
  return null;
}
