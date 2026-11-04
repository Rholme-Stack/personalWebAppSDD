import { TestBed } from '@angular/core/testing';
import { Stack } from './stack';

describe('Stack', () => {
  let compiled: HTMLElement;

  beforeEach(async () => {
    const fixture = TestBed.createComponent(Stack);
    await fixture.whenStable();
    compiled = fixture.nativeElement as HTMLElement;
  });

  it('should be the #stack section', () => {
    expect(compiled.querySelector('section#stack')).not.toBeNull();
  });

  it('should list .NET, Angular and SQL', () => {
    const names = Array.from(compiled.querySelectorAll('li')).map((li) => li.textContent?.trim());
    expect(names).toEqual(['.NET', 'Angular', 'SQL']);
  });

  it('should show a decorative logo for each technology', () => {
    const items = Array.from(compiled.querySelectorAll('li'));
    for (const item of items) {
      const img = item.querySelector('img');
      expect(img?.getAttribute('src')).toMatch(/^icons\/.+\.svg$/);
      expect(img?.getAttribute('alt')).toBe('');
    }
  });
});
