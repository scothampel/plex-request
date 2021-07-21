import { useEffect } from 'react';

export default function Logout({ setToken }) {
  // TODO: Maybe just make this a function in app, not sure yet
  useEffect(() => {
    // Remove client auth token, delete refresh token from db
    // Could potentially not get logged out if server down, non issue at the moment
    setToken(null)
    fetch('/auth/logout', {method: 'POST'})
      .catch(err => console.error('Internal Server Error', err));
  })

  return (<></>)
}
