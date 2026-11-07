import { DeferBlockBehavior, DeferBlockState, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LanguageService } from '../i18n/language.service';
import { Landing } from './landing';

describe('Landing', () => {
  async function render() {
    await TestBed.configureTestingModule({
      imports: [Landing],
      providers: [provideRouter([])],
      deferBlockBehavior: DeferBlockBehavior.Manual,
    }).compileComponents();
    TestBed.inject(LanguageService).setLang('en');
    const fixture = TestBed.createComponent(Landing);
    await fixture.whenStable();
    return fixture;
  }

  afterEach(() => localStorage.clear());

  it('should show the name as the main heading and the role', async () => {
    const compiled = (await render()).nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent?.trim()).toBe('Rodrigo Holme');
    expect(compiled.querySelector('.hero-role')?.textContent?.trim()).toBe('Developer');
  });

  it('should translate the role when the language changes', async () => {
    const fixture = await render();
    TestBed.inject(LanguageService).setLang('pt-BR');
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.hero-role')?.textContent?.trim()).toBe('Desenvolvedor');
  });

  it('should render the header and every section inside main', async () => {
    const compiled = (await render()).nativeElement as HTMLElement;
    expect(compiled.querySelector('app-site-header')).not.toBeNull();
    for (const selector of ['app-about-me', 'app-stack', 'app-photos', 'app-contact-form']) {
      expect(compiled.querySelector(`main ${selector}`)).not.toBeNull();
    }
  });

  it('should load the constellation later, in a deferred block outside main', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const fixture = await render();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-constellation')).toBeNull();

    const blocks = await fixture.getDeferBlocks();
    expect(blocks.length).toBe(1);
    await blocks[0].render(DeferBlockState.Complete);

    expect(compiled.querySelector('app-constellation')).not.toBeNull();
    expect(compiled.querySelector('main app-constellation')).toBeNull();
    vi.restoreAllMocks();
  });
});
