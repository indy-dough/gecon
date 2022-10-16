import { RunnerInterface } from '../interfaces/runner';
import { Chunk } from '../chunks/chunk';
import { GeneratorChunk } from '../chunks/generator';

export abstract class Runner implements RunnerInterface {
  generatorFn: any;
  chunk: Chunk;

  constructor(generatorFn: any) {
    this.generatorFn = generatorFn;
  }

  run(...args: any[]) {
    this.chunk = new GeneratorChunk(this.generatorFn(...args));
    this.chunk.run();
  }

  stop() {
    if (this.chunk) {
      this.chunk.stop();
    }
  }
}
