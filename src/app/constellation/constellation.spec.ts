import { TestBed } from '@angular/core/testing';
import { BustService } from './bust.service';
import { Constellation } from './constellation';
import { ConstellationRenderer } from './renderer';

describe('Constellation', () => {
  let frames: FrameRequestCallback[];

  function fakeRenderer() {
    return { setNodes: vi.fn(), resize: vi.fn(), draw: vi.fn(), dispose: vi.fn() };
  }

  async function render() {
    const fixture = TestBed.createComponent(Constellation);
    await fixture.whenStable();
    // Let the async start (bust download) finish.
    await new Promise((resolve) => setTimeout(resolve));
    await fixture.whenStable();
    return fixture;
  }

  function canvasOf(fixture: { nativeElement: HTMLElement }) {
    return fixture.nativeElement.querySelector('canvas') as HTMLCanvasElement;
  }

  /** Runs the animation frames queued so far (Angular also queues some for change detection). */
  function runQueuedFrames() {
    frames.splice(0).forEach((callback) => callback(16));
  }

  beforeEach(() => {
    frames = [];
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) =>
      frames.push(callback),
    );
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should be a decorative canvas, hidden from screen readers and keyboard', async () => {
    const canvas = canvasOf(await render());
    expect(canvas.getAttribute('aria-hidden')).toBe('true');
    expect(canvas.hasAttribute('tabindex')).toBe(false);
  });

  it('should stay hidden, without errors, when WebGL2 is not available', async () => {
    const load = vi.spyOn(TestBed.inject(BustService), 'load');

    const fixture = await render();
    runQueuedFrames();
    await fixture.whenStable();

    expect(canvasOf(fixture).classList.contains('ready')).toBe(false);
    expect(load).not.toHaveBeenCalled();
  });

  it('should stay hidden when the bust cannot be loaded', async () => {
    const renderer = fakeRenderer();
    vi.spyOn(ConstellationRenderer, 'create').mockReturnValue(
      renderer as unknown as ConstellationRenderer,
    );
    vi.spyOn(TestBed.inject(BustService), 'load').mockResolvedValue(null);

    const fixture = await render();
    runQueuedFrames();
    await fixture.whenStable();

    expect(canvasOf(fixture).classList.contains('ready')).toBe(false);
    expect(renderer.draw).not.toHaveBeenCalled();
    expect(renderer.dispose).toHaveBeenCalled();
  });

  it('should show the canvas after drawing the first frame', async () => {
    const renderer = fakeRenderer();
    vi.spyOn(ConstellationRenderer, 'create').mockReturnValue(
      renderer as unknown as ConstellationRenderer,
    );
    vi.spyOn(TestBed.inject(BustService), 'load').mockResolvedValue(new Float32Array(3000));

    const fixture = await render();
    runQueuedFrames();
    await fixture.whenStable();

    expect(renderer.setNodes).toHaveBeenCalled();
    expect(renderer.draw).toHaveBeenCalledTimes(1);
    expect(canvasOf(fixture).classList.contains('ready')).toBe(true);
  });

  it('should remove its listeners and stop drawing when destroyed', async () => {
    const renderer = fakeRenderer();
    vi.spyOn(ConstellationRenderer, 'create').mockReturnValue(
      renderer as unknown as ConstellationRenderer,
    );
    vi.spyOn(TestBed.inject(BustService), 'load').mockResolvedValue(new Float32Array(3000));
    const added = vi.spyOn(window, 'addEventListener');
    const removed = vi.spyOn(window, 'removeEventListener');

    const fixture = await render();
    fixture.destroy();

    const addedTypes = added.mock.calls.map(([type]) => type);
    for (const type of ['pointermove', 'pointerout', 'resize']) {
      expect(addedTypes).toContain(type);
      expect(removed.mock.calls.map(([t]) => t)).toContain(type);
    }
    expect(cancelAnimationFrame).toHaveBeenCalled();
    expect(renderer.dispose).toHaveBeenCalled();
  });
});
