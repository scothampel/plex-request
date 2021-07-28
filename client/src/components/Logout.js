import { useEffect } from 'react';

export default function Logout({ setToken, setRole, setNeedLogin }) {
  useEffect(() => {
    // Remove client auth token, delete refresh token from db
    // Could potentially not get logged out if server down, non issue at the moment
    setToken(null);
    setRole(null);
    setNeedLogin(true);
    fetch('/auth/logout', {method: 'POST'})
      .catch(err => console.error('Could not logout', err));
  })

  return (<></>)
}
