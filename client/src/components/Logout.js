import { useEffect } from 'react';

export default function Logout({ setToken }) {
  useEffect(() => {
    setToken(null)

    fetch('/auth/logout', {
      method: 'POST'
    })
      .catch(err => console.error('Internal Server Error', err));
  })

  return (<></>)
}
