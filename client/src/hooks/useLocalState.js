import { useState, useEffect } from 'react';

export default function useLocalState( key, val = null ) {
  const [value, setValue] = useState(localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : val);
  useEffect(() => {localStorage.setItem(key, JSON.stringify(value))}, [key, value]);
  return [value, setValue];
}