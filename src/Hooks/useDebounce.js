import {useEffect} from 'react';
import useTimeout from './useTimeout';

export default function useDebounce(callback, delay, dependencies) {
  const {reset, clear} = useTimeout(callback, delay);
  useEffect(() => reset, [...dependencies, reset]);
  useEffect(() => clear, []);
}

//* Usage

//todo: useDebouce(() => {}, 1000)   * 1st arg is callback, 2nd arg is delay
