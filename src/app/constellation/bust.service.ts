import { Injectable } from '@angular/core';
import { decodeBust } from './bust-format';

const BUST_URL = 'constellation/bust.bin';

@Injectable({ providedIn: 'root' })
export class BustService {
  /** Positions of the bust nodes, or null if the file cannot be loaded (the page works without it). */
  async load(): Promise<Float32Array | null> {
    try {
      const response = await fetch(BUST_URL);
      if (!response.ok) {
        throw new Error(`bust.bin: HTTP ${response.status}`);
      }
      return decodeBust(await response.arrayBuffer());
    } catch (error) {
      console.warn('Constellation disabled:', error);
      return null;
    }
  }
}
