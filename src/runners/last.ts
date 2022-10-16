import { Runner } from './runner';
import { GeneratorChunk } from '../chunks/generator';
import { Chunk } from '../chunks/chunk';

export class LastRunner extends Runner {
  chunk: Chunk;

  run(...args: any[]) {
    if (this.chunk) {
      this.chunk.stop();
    }

    this.chunk = new GeneratorChunk(this.generatorFn(...args));
    this.chunk.run();
  }

  stop() {
    if (this.chunk) {
      this.chunk.stop();
    }
  }
}
