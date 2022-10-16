import { Chunk } from './chunk';

export class DelayChunk extends Chunk {
  done = false;
  identifier = 'chunk';
  timeoutId: any;
  ms: number;

  constructor(ms: number) {
    super();
    this.ms = ms;
  }

  async run() {
    await new Promise(resolve => {
      this.timeoutId = setTimeout(resolve, this.ms);
    });
    this.done = true;
  }

  stop() {
    clearTimeout(this.timeoutId);
    this.done = true;
  }
}
