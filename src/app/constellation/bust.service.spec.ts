import { TestBed } from '@angular/core/testing';
import { BustService } from './bust.service';

function validBust(count = 1000): ArrayBuffer {
  const buffer = new ArrayBuffer(12 + count * 6);
  const view = new DataView(buffer);
  [...'BUST'].forEach((c, i) => view.setUint8(i, c.charCodeAt(0)));
  view.setUint32(4, 1, true);
  view.setUint32(8, count, true);
  view.setInt16(12, 32767, true);
  return buffer;
}

describe('BustService', () => {
  function stubFetch(response: Promise<Response>) {
    const fetchMock = vi.fn(() => response);
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
  }

  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should load the bust file and return its positions', async () => {
    const fetchMock = stubFetch(Promise.resolve(new Response(validBust())));

    const positions = await TestBed.inject(BustService).load();

    expect(fetchMock).toHaveBeenCalledWith('constellation/bust.bin');
    expect(positions?.length).toBe(3000);
    expect(positions?.[0]).toBeCloseTo(1, 5);
  });

  it('should return null when the file is missing', async () => {
    stubFetch(Promise.resolve(new Response('Not found', { status: 404 })));
    expect(await TestBed.inject(BustService).load()).toBeNull();
  });

  it('should return null on a network error', async () => {
    stubFetch(Promise.reject(new TypeError('Failed to fetch')));
    expect(await TestBed.inject(BustService).load()).toBeNull();
  });

  it('should return null when the file is not a valid bust', async () => {
    stubFetch(Promise.resolve(new Response(new ArrayBuffer(40))));
    expect(await TestBed.inject(BustService).load()).toBeNull();
    expect(console.warn).toHaveBeenCalled();
  });
});
