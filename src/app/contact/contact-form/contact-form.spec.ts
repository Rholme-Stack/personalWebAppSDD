import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LanguageService } from '../../i18n/language.service';
import { ContactForm } from './contact-form';

describe('ContactForm', () => {
  let fixture: ComponentFixture<ContactForm>;
  let compiled: HTMLElement;
  let language: LanguageService;

  beforeEach(async () => {
    language = TestBed.inject(LanguageService);
    language.setLang('en');
    fixture = TestBed.createComponent(ContactForm);
    await fixture.whenStable();
    compiled = fixture.nativeElement as HTMLElement;
  });

  afterEach(() => localStorage.clear());

  function field(name: 'name' | 'email' | 'message') {
    return compiled.querySelector(`#contact-${name}`) as HTMLInputElement | HTMLTextAreaElement;
  }

  function type(name: 'name' | 'email' | 'message', value: string) {
    field(name).value = value;
    field(name).dispatchEvent(new Event('input'));
  }

  function fillValid() {
    type('name', 'Ada Lovelace');
    type('email', 'ada@example.com');
    type('message', 'Hello Rodrigo, nice website!');
  }

  async function submit() {
    compiled.querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
  }

  function error(name: 'name' | 'email' | 'message') {
    return compiled.querySelector(`#contact-${name}-error`)?.textContent?.trim() ?? null;
  }

  function notice() {
    return compiled.querySelector('[role="status"]');
  }

  it('should be the #contact section', () => {
    expect(compiled.querySelector('section#contact')).not.toBeNull();
  });

  it('should have name, email and message fields with labels', () => {
    for (const name of ['name', 'email', 'message'] as const) {
      const label = compiled.querySelector(`label[for="contact-${name}"]`);
      expect(field(name)).not.toBeNull();
      expect(label).not.toBeNull();
    }
    expect(compiled.querySelector('label[for="contact-email"]')?.textContent?.trim()).toBe('Email');
  });

  it('should show three required errors and no notice when sent empty', async () => {
    await submit();
    expect(error('name')).toBe('This field is required');
    expect(error('email')).toBe('This field is required');
    expect(error('message')).toBe('This field is required');
    expect(notice()?.textContent?.trim() ?? '').toBe('');
  });

  it('should move the focus to the first invalid field', async () => {
    type('name', 'Ada');
    await submit();
    expect(document.activeElement).toBe(field('email'));
  });

  it('should show an error for an invalid email', async () => {
    fillValid();
    type('email', 'not-an-email');
    await submit();
    expect(error('email')).toBe('Enter a valid email');
  });

  it('should treat a name made of spaces as empty', async () => {
    fillValid();
    type('name', '    ');
    await submit();
    expect(error('name')).toBe('This field is required');
  });

  it('should enforce the length limits', async () => {
    fillValid();
    type('name', 'a'.repeat(101));
    type('email', `${'a'.repeat(243)}@example.com`);
    type('message', 'Too short');
    await submit();
    expect(error('name')).toBe('Maximum 100 characters');
    expect(error('email')).toBe('Maximum 254 characters');
    expect(error('message')).toBe('Minimum 10 characters');

    type('message', 'a'.repeat(2001));
    await submit();
    expect(error('message')).toBe('Maximum 2000 characters');
  });

  it('should mark invalid fields for assistive technologies', async () => {
    await submit();
    expect(field('name').getAttribute('aria-invalid')).toBe('true');
    expect(field('name').getAttribute('aria-describedby')).toBe('contact-name-error');
  });

  it('should show the not-active notice with a LinkedIn link and keep the values', async () => {
    fillValid();
    await submit();

    expect(notice()?.textContent).toContain('The contact form is not active yet');
    const link = notice()?.querySelector('a');
    expect(link?.getAttribute('href')).toBe('https://www.linkedin.com/in/rodrigo-holme');
    expect(link?.textContent?.trim()).toBe('LinkedIn');
    expect(field('name').value).toBe('Ada Lovelace');
    expect(field('email').value).toBe('ada@example.com');
    expect(field('message').value).toBe('Hello Rodrigo, nice website!');
    expect(error('name')).toBeNull();
  });

  it('should hide the notice when a later submit has errors', async () => {
    fillValid();
    await submit();
    type('email', '');
    await submit();
    expect(notice()?.textContent?.trim() ?? '').toBe('');
    expect(error('email')).toBe('This field is required');
  });

  it('should show the errors in the active language', async () => {
    await submit();
    language.setLang('es');
    await fixture.whenStable();
    expect(error('name')).toBe('Este campo es obligatorio');
  });
});
