import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should show the under construction page at the root URL', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/');
    expect(harness.fixture.nativeElement.querySelector('app-under-construction')).not.toBeNull();
  });

  it('should show the under construction page at any other URL', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/cualquier/cosa');
    expect(harness.fixture.nativeElement.querySelector('app-under-construction')).not.toBeNull();
  });
});
