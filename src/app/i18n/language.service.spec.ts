import { TestBed } from '@angular/core/testing';
import { LanguageService } from './language.service';

describe('LanguageService', () => {
  function setBrowserLanguages(languages: string[]) {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(languages);
  }

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = 'en';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should start with the language saved in localStorage', () => {
    localStorage.setItem('lang', 'es');
    setBrowserLanguages(['pt-BR']);
    expect(TestBed.inject(LanguageService).lang()).toBe('es');
  });

  it('should use Spanish when the browser is in any Spanish variant', () => {
    setBrowserLanguages(['es-MX']);
    expect(TestBed.inject(LanguageService).lang()).toBe('es');
  });

  it('should use Brazilian Portuguese when the browser is in any Portuguese variant', () => {
    setBrowserLanguages(['pt-PT']);
    expect(TestBed.inject(LanguageService).lang()).toBe('pt-BR');
  });

  it('should use the first supported browser language', () => {
    setBrowserLanguages(['fr-FR', 'pt-BR', 'en-US']);
    expect(TestBed.inject(LanguageService).lang()).toBe('pt-BR');
  });

  it('should fall back to English when no browser language is supported', () => {
    setBrowserLanguages(['fr-FR']);
    expect(TestBed.inject(LanguageService).lang()).toBe('en');
  });

  it('should ignore an invalid saved value', () => {
    localStorage.setItem('lang', 'de');
    setBrowserLanguages(['es-ES']);
    expect(TestBed.inject(LanguageService).lang()).toBe('es');
  });

  it('should set the html lang attribute on start', () => {
    setBrowserLanguages(['pt-BR']);
    TestBed.inject(LanguageService);
    expect(document.documentElement.lang).toBe('pt-BR');
  });

  it('should save the chosen language and update the html lang attribute', () => {
    setBrowserLanguages(['en-US']);
    const service = TestBed.inject(LanguageService);

    service.setLang('pt-BR');

    expect(service.lang()).toBe('pt-BR');
    expect(localStorage.getItem('lang')).toBe('pt-BR');
    expect(document.documentElement.lang).toBe('pt-BR');
  });

  it('should expose the translations of the active language', () => {
    setBrowserLanguages(['en-US']);
    const service = TestBed.inject(LanguageService);
    expect(service.t().role).toBe('Developer');

    service.setLang('es');
    expect(service.t().role).toBe('Desarrollador');
  });

  it('should keep working when localStorage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    setBrowserLanguages(['es-ES']);

    const service = TestBed.inject(LanguageService);
    expect(service.lang()).toBe('es');

    service.setLang('en');
    expect(service.lang()).toBe('en');
  });
});
