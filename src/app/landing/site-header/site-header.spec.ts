import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LanguageService } from '../../i18n/language.service';
import { SiteHeader } from './site-header';

describe('SiteHeader', () => {
  let compiled: HTMLElement;
  let language: LanguageService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteHeader],
      providers: [provideRouter([])],
    }).compileComponents();

    language = TestBed.inject(LanguageService);
    language.setLang('en');
    const fixture = TestBed.createComponent(SiteHeader);
    await fixture.whenStable();
    compiled = fixture.nativeElement as HTMLElement;
  });

  afterEach(() => localStorage.clear());

  function select() {
    return compiled.querySelector('select') as HTMLSelectElement;
  }

  it('should offer the three languages with their own names', () => {
    const options = Array.from(select().options).map((o) => o.textContent?.trim());
    expect(options).toEqual(['English', 'Español', 'Português (Brasil)']);
  });

  it('should give the selector an accessible label', () => {
    const label = compiled.querySelector(`label[for="${select().id}"]`);
    expect(label?.textContent?.trim()).toBe('Language');
  });

  it('should select the active language', () => {
    expect(select().value).toBe('en');
  });

  it('should change the language when another option is chosen', () => {
    const setLang = vi.spyOn(language, 'setLang');
    select().value = 'pt-BR';
    select().dispatchEvent(new Event('change'));
    expect(setLang).toHaveBeenCalledWith('pt-BR');
  });

  it('should link to the about, stack and contact sections', () => {
    const hrefs = Array.from(compiled.querySelectorAll('a[href*="#"]')).map((a) =>
      a.getAttribute('href'),
    );
    expect(hrefs).toEqual(['/#about', '/#stack', '/#contact']);
  });
});
