import {useState} from 'react';

export default function useArray(arrayItems) {
  const [items, setItems] = useState(arrayItems);

  function push(element) {
    setItems(a => [...a, element]);
  }

  function filter(callback) {
    setItems(a => a.filter(callback));
  }

  function update(index, newElement) {
    setItems(a => [
      ...a.slice(0, index),
      newElement,
      ...a.slice(index + 1, a.length - 1),
    ]);
  }

  function remove(index) {
    setItems(a => [...a.slice(0, index), ...a.slice(index + 1, a.length - 1)]);
  }

  function clear() {
    setItems([]);
  }

  return {items, set: setItems, push, filter, update, remove, clear};
}

//* Usage

//todo: const {array, set, push, filter, update, remove, clear} = useArray([1,2,3,4,5])
