import { useCallback, useState } from "react";

const useDebounceCallback = (callback, delay = 300) => {
  const [debounceTimer, setDebounceTimer] = useState(null);

  const debouncedCallback = useCallback(
    (...args) => {
      return new Promise((resolve, reject) => {
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }

        const newTimer = setTimeout(async () => {
          try {
            const result = await callback(...args);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        }, delay);

        setDebounceTimer(newTimer);
      });
    },
    [callback, delay, debounceTimer]
  );

  return debouncedCallback;
};

export default useDebounceCallback;
