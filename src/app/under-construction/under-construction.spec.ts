import { TestBed } from '@angular/core/testing';
import { UnderConstruction } from './under-construction';

describe('UnderConstruction', () => {
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnderConstruction],
    }).compileComponents();

    const fixture = TestBed.createComponent(UnderConstruction);
    await fixture.whenStable();
    compiled = fixture.nativeElement as HTMLElement;
  });

  it('should show the site name as the main heading', () => {
    expect(compiled.querySelector('h1')?.textContent?.trim()).toBe('Rodrigo Holme Web');
  });

  it('should show the notice in English followed by Spanish', () => {
    const paragraphs = Array.from(compiled.querySelectorAll('p')).map((p) =>
      p.textContent?.trim(),
    );
    expect(paragraphs).toEqual(['Page under construction', 'Página en construcción']);
  });

  it('should mark the Spanish notice with lang="es"', () => {
    const spanish = compiled.querySelectorAll('p')[1];
    expect(spanish?.getAttribute('lang')).toBe('es');
  });
});
