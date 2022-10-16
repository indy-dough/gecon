import { ChunkInterface } from '../interfaces/chunk';

export abstract class Chunk implements ChunkInterface {
  identifier = 'chunk';
  done = false;

  abstract run(): void;
  abstract stop(): void;
}
