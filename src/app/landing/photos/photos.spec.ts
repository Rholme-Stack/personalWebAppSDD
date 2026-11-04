import { TestBed } from '@angular/core/testing';
import { LanguageService } from '../../i18n/language.service';
import { Lang } from '../../i18n/translations';
import { Photos } from './photos';

describe('Photos', () => {
  async function render(lang: Lang) {
    TestBed.inject(LanguageService).setLang(lang);
    const fixture = TestBed.createComponent(Photos);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  afterEach(() => localStorage.clear());

  it('should be the #photos section', async () => {
    const compiled = await render('en');
    expect(compiled.querySelector('section#photos')).not.toBeNull();
  });

  it.each<[Lang, string]>([
    ['en', 'Coming soon'],
    ['es', 'Próximamente'],
    ['pt-BR', 'Em breve'],
  ])('should show the coming soon message in %s', async (lang, message) => {
    const compiled = await render(lang);
    expect(compiled.querySelector('.coming-soon')?.textContent?.trim()).toBe(message);
  });
});
