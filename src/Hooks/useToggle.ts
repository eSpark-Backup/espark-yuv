import {useState} from 'react';

export default function useToggle(item) {
  const [value, setValue] = useState(item);

  function toggleValue(value) {
    setValue(currentValue =>
      typeof value === 'boolean' ? value : !currentValue,
    );
  }
  return [value, toggleValue];
}

//* Usage

//todo: const [value, ToggleValue] = useToggle(value)   * here value is boolean
