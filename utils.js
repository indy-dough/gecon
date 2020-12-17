export function debounce (fn, wait) {
  let last = null;
  let timeout = null;

  return (...args) => {
    const current = Object.create({});
    last = current;

    timeout = clearTimeout(timeout);
    timeout = setTimeout(() => {
      if (last === current) {
        fn(...args);
      }
    }, wait);
  };
}
