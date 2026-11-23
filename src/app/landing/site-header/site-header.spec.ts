import { ViewportScroller } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LanguageService } from '../../i18n/language.service';
import { Lang } from '../../i18n/translations';
import { SiteHeader } from './site-header';

describe('SiteHeader', () => {
  let fixture: ComponentFixture<SiteHeader>;
  let compiled: HTMLElement;
  let language: LanguageService;
  let scroller: ViewportScroller;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteHeader],
      providers: [provideRouter([])],
    }).compileComponents();

    language = TestBed.inject(LanguageService);
    language.setLang('en');
    scroller = TestBed.inject(ViewportScroller);
    vi.spyOn(scroller, 'setOffset');
    vi.spyOn(scroller, 'scrollToPosition').mockImplementation(() => {});
    fixture = TestBed.createComponent(SiteHeader);
    await fixture.whenStable();
    compiled = fixture.nativeElement as HTMLElement;
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  function select() {
    return compiled.querySelector('select') as HTMLSelectElement;
  }

  function menuButton() {
    return compiled.querySelector('button.menu-button') as HTMLButtonElement;
  }

  function menuLinks() {
    return Array.from(compiled.querySelectorAll<HTMLAnchorElement>('a[href*="#"]'));
  }

  async function openMenu() {
    menuButton().click();
    await fixture.whenStable();
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

  it.each<[Lang, string]>([
    ['en', 'EN'],
    ['es', 'ES'],
    ['pt-BR', 'PT'],
  ])('should show only the language code in %s, hidden from screen readers', async (lang, code) => {
    language.setLang(lang);
    await fixture.whenStable();
    const visible = compiled.querySelector('.language [aria-hidden="true"]');
    expect(visible?.textContent?.trim()).toBe(code);
    expect(select().value).toBe(lang);
  });

  it('should change the language when another option is chosen', () => {
    const setLang = vi.spyOn(language, 'setLang');
    select().value = 'pt-BR';
    select().dispatchEvent(new Event('change'));
    expect(setLang).toHaveBeenCalledWith('pt-BR');
  });

  it('should show only the logo, named after Rodrigo, in the link to the top of the page', () => {
    const home = compiled.querySelector('a[href="/"]');
    const logo = home?.querySelector('img');
    expect(logo?.getAttribute('src')).toBe('logo-rh.svg');
    expect(logo?.getAttribute('alt')).toBe('Rodrigo Holme');
    expect(home?.textContent?.trim()).toBe('');
  });

  it('should scroll to the top of the page when the logo is clicked', () => {
    compiled.querySelector<HTMLElement>('a[href="/"]')!.click();
    expect(scroller.scrollToPosition).toHaveBeenCalledWith([0, 0]);
  });

  it('should leave room for the header when jumping to a section', () => {
    Object.defineProperty(compiled, 'offsetHeight', { value: 80 });
    const offset = vi.mocked(scroller.setOffset).mock.lastCall?.[0] as () => [number, number];
    expect(offset()).toEqual([0, 80]);
  });

  it('should open LinkedIn in a new tab from the contact button', () => {
    const contact = compiled.querySelector('a.contact');
    expect(contact?.getAttribute('href')).toBe('https://www.linkedin.com/in/rodrigo-holme');
    expect(contact?.getAttribute('target')).toBe('_blank');
    expect(contact?.getAttribute('rel')).toContain('noopener');
  });

  it('should show the LinkedIn logo as decoration after the contact text', () => {
    const contact = compiled.querySelector('a.contact')!;
    const icon = contact.querySelector('img');
    expect(icon?.getAttribute('src')).toBe('icons/linkedin.svg');
    expect(icon?.getAttribute('alt')).toBe('');
    expect(contact.lastElementChild).toBe(icon);
    expect(icon?.previousSibling?.textContent?.trim()).toBe('Contact');
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

  describe('menu', () => {
    // Focus only works on elements attached to the document.
    beforeEach(() => document.body.appendChild(compiled));
    afterEach(() => compiled.remove());

    async function pressEscape() {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      await fixture.whenStable();
    }

    function expectClosed() {
      expect(fixture.componentInstance.menuOpen()).toBe(false);
      expect(menuButton().getAttribute('aria-expanded')).toBe('false');
      expect(menuLinks()).toEqual([]);
    }

    it('should start closed, with no links to the sections', () => {
      expectClosed();
    });

    it.each<[Lang, string[]]>([
      ['en', ['About Me', 'Stack', 'Photos']],
      ['es', ['Sobre mí', 'Stack', 'Fotos']],
      ['pt-BR', ['Sobre mim', 'Stack', 'Fotos']],
    ])('should offer the three sections when open in %s', async (lang, names) => {
      language.setLang(lang);
      await openMenu();
      expect(menuButton().getAttribute('aria-expanded')).toBe('true');
      expect(menuLinks().map((a) => a.getAttribute('href'))).toEqual([
        '/#about',
        '/#stack',
        '/#photos',
      ]);
      expect(menuLinks().map((a) => a.textContent?.trim())).toEqual(names);
    });

    it.each<[Lang, string]>([
      ['en', 'Menu'],
      ['es', 'Menú'],
      ['pt-BR', 'Menu'],
    ])('should keep the same button name open and closed in %s', async (lang, name) => {
      language.setLang(lang);
      await fixture.whenStable();
      expect(menuButton().getAttribute('aria-label')).toBe(name);
      await openMenu();
      expect(menuButton().getAttribute('aria-label')).toBe(name);
    });

    it('should close with the button', async () => {
      await openMenu();
      menuButton().click();
      await fixture.whenStable();
      expectClosed();
    });

    it('should close with Escape and return the focus to the button', async () => {
      await openMenu();
      menuLinks()[1].focus();
      await pressEscape();
      expectClosed();
      expect(document.activeElement).toBe(menuButton());
    });

    it('should stay open when Escape closes the language dropdown', async () => {
      await openMenu();
      // jsdom has no dropdowns, so the open state of the select is faked.
      vi.spyOn(select(), 'matches').mockImplementation((selector) => selector.includes(':open'));
      select().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await fixture.whenStable();
      expect(menuButton().getAttribute('aria-expanded')).toBe('true');

      vi.mocked(select().matches).mockRestore();
      select().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await fixture.whenStable();
      expectClosed();
    });

    it('should not take the focus with Escape when it is already closed', async () => {
      select().focus();
      await pressEscape();
      expect(document.activeElement).toBe(select());
    });

    it('should close when a section is chosen', async () => {
      await openMenu();
      menuLinks()[2].click();
      await fixture.whenStable();
      expectClosed();
    });

    it('should close when the logo is clicked', async () => {
      await openMenu();
      compiled.querySelector<HTMLElement>('a[href="/"]')!.click();
      await fixture.whenStable();
      expectClosed();
      expect(scroller.scrollToPosition).toHaveBeenCalledWith([0, 0]);
    });

    it('should stay open and translate its options when the language changes', async () => {
      await openMenu();
      select().value = 'es';
      select().dispatchEvent(new Event('change'));
      await fixture.whenStable();
      expect(menuButton().getAttribute('aria-expanded')).toBe('true');
      expect(menuLinks().map((a) => a.textContent?.trim())).toEqual(['Sobre mí', 'Stack', 'Fotos']);
    });
  });
});
