export interface RunnerInterface {
  generatorFn: Generator;

  run(...args: any[]): void;
  stop(): void;
}
