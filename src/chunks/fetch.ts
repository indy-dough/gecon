import { Chunk } from './chunk';

export class FetchChunk extends Chunk {
  done = false;
  identifier = 'chunk';
  controller = new AbortController();
  resource;
  options;

  constructor(resource: RequestInfo | URL, options: RequestInit) {
    super();
    this.resource = resource;
    this.options = options;
    this.options.signal = this.controller.signal;
  }

  async run() {
    const response = await fetch(this.resource, this.options);
    this.done = true;
    return response;
  }

  stop() {
    if (this.controller) {
      this.controller.abort();
    }
    this.done = true;
  }
}
