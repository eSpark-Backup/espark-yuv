import {useEffect, useRef} from 'react';

export default function useUpdateEffect(callback, dependencies) {
  const firstRenderRef = useRef(true);

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }
    return callback();
  }, dependencies);
}

//* Usage

//todo: useUpdateEffect(() => {}, dependencies)   * here 1st arg is callback and 2nd arg is dependencies in array
