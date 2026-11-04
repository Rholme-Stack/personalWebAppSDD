import { TestBed } from '@angular/core/testing';
import { LanguageService } from '../../i18n/language.service';
import { Lang } from '../../i18n/translations';
import { AboutMe } from './about-me';

describe('AboutMe', () => {
  async function render(lang: Lang) {
    TestBed.inject(LanguageService).setLang(lang);
    const fixture = TestBed.createComponent(AboutMe);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  afterEach(() => localStorage.clear());

  it('should be the #about section', async () => {
    const compiled = await render('en');
    expect(compiled.querySelector('section#about')).not.toBeNull();
  });

  it('should show the name', async () => {
    const compiled = await render('en');
    expect(compiled.querySelector('.name')?.textContent?.trim()).toBe('Rodrigo Holme');
  });

  it.each<[Lang, string]>([
    ['en', 'Developer'],
    ['es', 'Desarrollador'],
    ['pt-BR', 'Desenvolvedor'],
  ])('should show the role in %s', async (lang, role) => {
    const compiled = await render(lang);
    expect(compiled.querySelector('.role')?.textContent?.trim()).toBe(role);
  });

  it('should show the bio in the active language', async () => {
    const compiled = await render('es');
    expect(compiled.querySelector('.bio')?.textContent).toContain('Soy desarrollador');
  });

  it.each<[Lang, string]>([
    ['en', 'Illustration of Rodrigo Holme'],
    ['es', 'Ilustración de Rodrigo Holme'],
    ['pt-BR', 'Ilustração de Rodrigo Holme'],
  ])('should describe the picture in %s', async (lang, alt) => {
    const compiled = await render(lang);
    const img = compiled.querySelector('img.photo');
    expect(img?.getAttribute('src')).toBe('images/rodrigo.webp');
    expect(img?.getAttribute('alt')).toBe(alt);
  });

  it('should link to LinkedIn, GitHub and Instagram in a new tab', async () => {
    const compiled = await render('en');
    const links = Array.from(compiled.querySelectorAll<HTMLAnchorElement>('.social a'));

    expect(links.map((a) => a.getAttribute('aria-label'))).toEqual([
      'Rodrigo Holme on LinkedIn (opens in a new tab)',
      'Rodrigo Holme on GitHub (opens in a new tab)',
      'Rodrigo Holme on Instagram (opens in a new tab)',
    ]);
    expect(links[0].getAttribute('href')).toBe('https://www.linkedin.com/in/rodrigo-holme');
    expect(links[1].getAttribute('href')).toBe('https://github.com/Rholme-Stack');
    for (const link of links) {
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    }
  });

  it('should translate the social link labels', async () => {
    const compiled = await render('es');
    const first = compiled.querySelector('.social a');
    expect(first?.getAttribute('aria-label')).toBe(
      'Rodrigo Holme en LinkedIn (se abre en una pestaña nueva)',
    );
  });
});
