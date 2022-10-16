import { Chunk } from './chunk';
import { isChunk, isGenerator, isPromise } from '../helpers';

interface Next {
  value: any;
  done: boolean;
}

export class GeneratorChunk extends Chunk {
  stopped = false;
  generator;
  nestedChunks: Array<Chunk> = [];

  constructor(generator: any) {
    super();
    this.generator = generator;
  }

  async run() {
    let next: Next;

    next = { value: undefined, done: false };

    try {
      while (!this.stopped && !next.done) {
        next = this.generator.next(next.value);

        if (isChunk(next.value)) {
          this.nestedChunks.push(next.value);
          next.value = await next.value.run();
        }
        if (isPromise(next.value)) {
          next.value = await next.value;
        }
        if (isGenerator(next.value)) {
          const nested = new GeneratorChunk(next.value);
          this.nestedChunks.push(nested);
          next.value = await nested.run();
        }
      }
    } catch (error) {
      this.done = true;
      throw error;
    }

    this.done = true;

    return next.value;
  }

  stop() {
    this.stopped = true;
    this.nestedChunks.forEach(chunk => chunk.stop());
    this.done = true;
  }
}
