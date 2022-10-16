export interface ChunkInterface {
  readonly identifier: string;
  done: boolean;

  run(): void;
  stop(): void;
}
