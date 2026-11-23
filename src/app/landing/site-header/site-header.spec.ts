import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LanguageService } from '../../i18n/language.service';
import { Lang } from '../../i18n/translations';
import { SiteHeader } from './site-header';

describe('SiteHeader', () => {
  let fixture: ComponentFixture<SiteHeader>;
  let compiled: HTMLElement;
  let language: LanguageService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteHeader],
      providers: [provideRouter([])],
    }).compileComponents();

    language = TestBed.inject(LanguageService);
    language.setLang('en');
    fixture = TestBed.createComponent(SiteHeader);
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

  it('should link only to the about and stack sections', () => {
    const hrefs = Array.from(compiled.querySelectorAll('a[href*="#"]')).map((a) =>
      a.getAttribute('href'),
    );
    expect(hrefs).toEqual(['/#about', '/#stack']);
  });

  it('should show the logo as decoration inside the link to the top of the page', () => {
    const home = compiled.querySelector('a[href="/"]');
    const logo = home?.querySelector('img');
    expect(logo?.getAttribute('src')).toBe('logo-rh.svg');
    expect(logo?.getAttribute('alt')).toBe('');
    expect(home?.textContent?.trim()).toBe('Rodrigo Holme');
  });

  it('should open LinkedIn in a new tab from the contact button', () => {
    const contact = compiled.querySelector('a.contact');
    expect(contact?.getAttribute('href')).toBe('https://www.linkedin.com/in/rodrigo-holme');
    expect(contact?.getAttribute('target')).toBe('_blank');
    expect(contact?.getAttribute('rel')).toContain('noopener');
  });

  it.each<[Lang, string, string]>([
    ['en', 'Contact', 'Contact Rodrigo Holme on LinkedIn (opens in a new tab)'],
    ['es', 'Contacto', 'Contacto: Rodrigo Holme en LinkedIn (se abre en una pestaña nueva)'],
    ['pt-BR', 'Contato', 'Contato: Rodrigo Holme no LinkedIn (abre em uma nova aba)'],
  ])('should translate the contact button in %s', async (lang, text, label) => {
    language.setLang(lang);
    await fixture.whenStable();
    const contact = compiled.querySelector('a.contact');
    expect(contact?.textContent?.trim()).toBe(text);
    expect(contact?.getAttribute('aria-label')).toBe(label);
  });
});
