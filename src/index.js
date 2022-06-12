/**
 * Generators control library
 */

/**
 * Run provided generator
 *
 * @param generatorFn Generator function
 * @param args
 * @returns {Promise}
 */
export async function call(generatorFn, ...args) {
  return execFn(generatorFn, args);
}

/**
 * Return async function for provided generator
 *
 * @param generatorFn Generator function
 * @returns {function}
 */
export function promisify(generatorFn) {
  let current;
  let last;

  const fn = async function (...args) {
    current = last;
    return execFn(generatorFn, args, () => current === last);
  };

  fn.stop = () => {
    last = Object.create({});
  };

  return fn;
}

/**
 * Each next call of that function will be ignored until first function completed
 * Return async function for provided generator
 *
 * @param generatorFn Generator function
 * @returns {function}
 */
export function first(generatorFn) {
  let hasFirst = false;
  let first = null;

  const fn = async function (...args) {
    if (hasFirst) {
      return;
    }

    const current = Object.create({});
    first = current;
    hasFirst = true;

    try {
      const value = await execFn(generatorFn, args, () => current === first);
      if (current === first) {
        hasFirst = false;

        return value;
      }
    } catch (error) {
      if (current === first) {
        hasFirst = false;
        throw error;
      }
    }
  };

  fn.stop = () => {
    first = Object.create({});
    hasFirst = false;
  };

  return fn;
}

/**
 * Only last simultaneous call of that function will be completed
 * Return async function for provided generator
 *
 * @param generatorFn Generator function
 * @returns {function}
 */
export function last(generatorFn) {
  let last = null;

  const fn = async function (...args) {
    const current = Object.create({});
    last = current;

    return execFn(generatorFn, args, () => current === last);
  };

  fn.stop = () => {
    last = Object.create({});
  };

  return fn;
}

/**
 * Each call of that function will be completed with FIFO method
 * Return async function for provided generator
 *
 * @param generatorFn Generator function
 * @param options options
 * @returns {function}
 */
export function sync(generatorFn, options) {
  const queue = [];
  let isRunning = 0;
  const parallel = options.parallel || 1;

  async function runQueue() {
    if (isRunning === parallel || queue.length === 0) {
      return;
    }

    isRunning++;

    const { resolve, reject, args } = queue.shift();

    try {
      const value = await execFn(generatorFn, args);
      resolve(value);
    } catch (error) {
      reject(error);
    }

    isRunning--;
    runQueue();
  }

  return async function (...args) {
    return new Promise((resolve, reject) => {
      queue.push({ resolve, reject, args });
      runQueue();
    });
  };
}

/**
 * It is waiting for prev async function execution
 * Only last simultaneous call of that function will be completed
 * Return async function for provided generator
 *
 * @param generatorFn Generator function
 * @returns {function}
 */
export function lastSync(generatorFn) {
  const queue = [];
  let last = null;
  let isRunning = false;

  async function runQueue() {
    if (isRunning || queue.length === 0) {
      return;
    }

    isRunning = true;

    const { resolve, reject, args, current } = queue.shift();

    try {
      const value = await execFn(generatorFn, args, () => last === current);
      resolve(value);
    } catch (error) {
      reject(error);
    }

    isRunning = false;
    runQueue();
  }

  return async function (...args) {
    const current = Object.create({});
    last = current;

    return new Promise((resolve, reject) => {
      queue.push({ resolve, reject, args, current });
      runQueue();
    });
  };
}

/**
 * Generator for delay execution
 *
 * @param ms Milliseconds
 * @returns {Generator<Promise<unknown>, void, *>}
 */
export function* delay(ms) {
  yield new Promise(resolve => setTimeout(resolve, ms));
}

async function execFn(generatorFn, args, isActual) {
  const generator = generatorFn(...args);

  return exec(generator, isActual);
}

async function evaluate(nextObj, isActual) {
  let error;
  let value;

  try {
    value = await getValue(nextObj, isActual);
  } catch (e) {
    error = e;
  }

  return [error, value];
}

async function exec(generator, isActual) {
  let nextObj = generator.next();
  let [error, value] = await evaluate(nextObj, isActual);
  while (!nextObj.done) {
    if (isActual && !isActual()) {
      return;
    }
    nextObj = error ? generator.throw(error) : generator.next(value);
    [error, value] = await evaluate(nextObj, isActual);
  }

  return value;
}

async function getValue(nextObj, isActual) {
  let value = nextObj.value;

  if (!value) {
    return value;
  }
  if (isPromise(nextObj.value)) {
    value = await nextObj.value;
  }
  if (isGenerator(nextObj.value)) {
    value = await exec(nextObj.value, isActual);
  }

  return value;
}

function isPromise(obj) {
  return typeof obj.then === 'function';
}

function isGenerator(obj) {
  return typeof obj.next === 'function';
}
