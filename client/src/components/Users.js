import { useEffect, useState } from 'react';
import '../styles/Users.css';

export default function Users({ token }) {
  const [users, setUsers] = useState([{name: 'Loading...', role: 'info'}]);

  // TODO: fetches every 4m55s because of token refresh, probably change this
  useEffect(() => {
    fetch('/admin/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        const { status, message } = data;
        console.log(data)
        if (status === 1) {
          setUsers(message);
        }
        else {
          setUsers([{ name: 'There are currently no users', role: 'info' }]);
        }
      })
  },[token])

  return (
    <ul className="list-group mb-3">
      <li className='list-group-item bg-light'><h3>Users</h3></li>
      {
          users.map((val, index) => {
            const { name, user, role } = val;
            // Loading state
            if (role === 'info') {
              return <li key={index} className='list-group-item'>{name}</li>
            }
            return <li key={index} className='list-group-item'><b>{user} </b><span>({name})</span> <span className={'badge ' + (role === 'admin' ? 'bg-danger' : role === 'user' ? 'bg-primary' : 'bg-warning')}>{role.toUpperCase()}</span></li>
          })
        }
    </ul>
  );
}