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
export async function call (generatorFn, ...args) {
  return execFn(generatorFn, args);
}

/**
 * Return async function for provided generator
 *
 * @param generatorFn Generator function
 * @returns {function: Promise}
 */
export function promisify (generatorFn) {
  return async function (...args) {
    return execFn(generatorFn, args);
  };
}

/**
 * Each next call of that function will be ignored until first function completed
 * Return async function for provided generator
 *
 * @param generatorFn Generator function
 * @returns {function: Promise}
 */
export function first (generatorFn) {
  let hasFirst = false;

  return async function (...args) {
    if (hasFirst) {
      return;
    }

    hasFirst = true;
    const value = await execFn(generatorFn, args);
    hasFirst = false;

    return value;
  };
}

/**
 * Only last simultaneous call of that function will be completed
 * Return async function for provided generator
 *
 * @param generatorFn Generator function
 * @returns {function: Promise}
 */
export function last (generatorFn) {
  let last = null;

  return async function (...args) {
    const current = Object.create({});
    last = current;

    return execFn(generatorFn, args, () => current === last);
  };
}

/**
 * Each call of that function will be completed with FIFO method
 * Return async function for provided generator
 *
 * @param generatorFn Generator function
 * @returns {function: Promise}
 */
export function sync (generatorFn) {
  const queue = [];
  let isRunning = false;

  async function runQueue () {
    if (isRunning || queue.length === 0) {
      return;
    }

    isRunning = true;

    const { resolve, reject, args } = queue.shift();

    try {
      const value = await execFn(generatorFn, args);
      resolve(value);
    } catch (error) {
      reject(error);
    }

    isRunning = false;
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
 * @returns {function: Promise}
 */
export function lastSync (generatorFn) {
  const queue = [];
  let last = null;
  let isRunning = false;

  async function runQueue () {
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
export function * delay (ms) {
  yield new Promise(resolve => setTimeout(resolve, ms));
}

async function execFn (generatorFn, args, isActual) {
  const generator = generatorFn(...args);

  return exec(generator, isActual);
}

async function exec (generator, isActual) {
  let nextObj = generator.next();
  let value = await getValue(nextObj, isActual);
  while (!nextObj.done) {
    if (isActual && !isActual()) {
      return;
    }
    nextObj = generator.next(value);
    value = await getValue(nextObj, isActual);
  }

  return value;
}

async function getValue (nextObj, isActual) {
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

function isPromise (obj) {
  return typeof obj.then === 'function';
}

function isGenerator (obj) {
  return typeof obj.next === 'function';
}
