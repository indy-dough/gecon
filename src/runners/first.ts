import { Runner } from './runner';
import { GeneratorChunk } from '../chunks/generator';
import { Chunk } from '../chunks/chunk';

export class FirstRunner extends Runner {
  chunk: Chunk;

  run(...args: any[]) {
    if (this.chunk && !this.chunk.done) {
      return;
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
