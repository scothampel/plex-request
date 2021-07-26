import { useEffect, useState } from 'react';
import '../styles/Users.css';

export default function Users({ token }) {
  const [users, setUsers] = useState([{ name: 'Loading...', role: 'info' }]);

  useEffect(() => {
    // Check if no users have been fetched yet
    // handleClick causes rerender, don't fetch again if that happens
    // Also stops fetch on token refresh
    // Doesn't prevent if there are no users, non-issue really
    if (users[0].role === 'info') {
      fetch('/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          const { status, message } = data;
          if (status === 1) {
            setUsers(message);
          }
          else {
            setUsers([{ name: 'There are currently no users', role: 'info' }]);
          }
        })
    }
  }, [token, users])

  const handleClick = e => {
    // Get user and roll from target dataset
    const { user, role } = e.target.dataset;

    fetch('/admin/role', {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-type': 'application/json'
      },
      body: JSON.stringify({ user, role })
    })
      .then(res => res.json())
      .then(data => {
        const { status, message } = data;

        if (status === 1) {
          // Update role of modified user on front-end
          setUsers(users.map((val, index) => {
            // Match user
            if (val.user === user) {
              // Assign new role
              val.role = role;
            }
            return val;
          }));
        }
        else {
          // No other handling here, front-end shouldn't allow for errors
          // Still notify just incase
          console.error(message)
        }
      })
      .catch(err => console.error('Could not change role', err));

  }

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
          return (
            <li key={index} className='list-group-item'>
              <b>{user} </b>
              <span>({name}) </span>
              <span className={'badge ' + (role === 'admin' ? 'bg-danger' : role === 'user' ? 'bg-primary' : 'bg-warning')}>{role.toUpperCase()}</span>
              <div className='dropdown float-end'>
                <button className='btn btn-sm btn-outline-secondary dropdown-toggle' type='button' id={'userMenuDrop' + index} data-bs-toggle='dropdown' />
                <ul className='dropdown-menu'>
                  {/* TODO: see if this code can be cut down */}
                  {
                    // Controls for admin user
                    role === 'admin' &&
                    <>
                      <li><button className='dropdown-item btn-light' type='button' onClick={handleClick} data-user={user} data-role='user'>Make user</button></li>
                      <li><button className='dropdown-item btn-light' type='button' onClick={handleClick} data-user={user} data-role='unconfirmed'>Make unconfirmed</button></li>
                    </>
                  }
                  {
                    // Controls for normal user
                    role === 'user' &&
                    <>
                      <li><button className='dropdown-item btn-light' type='button' onClick={handleClick} data-user={user} data-role='admin'>Make admin</button></li>
                      <li><button className='dropdown-item btn-light' type='button' onClick={handleClick} data-user={user} data-role='unconfirmed'>Make unconfirmed</button></li>
                    </>
                  }
                  {
                    // Controls for unconfirmed user
                    role === 'unconfirmed' &&
                    <>
                      <li><button className='dropdown-item btn-light' type='button' onClick={handleClick} data-user={user} data-role='user'>Make user</button></li>
                      <li><button className='dropdown-item btn-light' type='button' onClick={handleClick} data-user={user} data-role='admin'>Make admin</button></li>
                    </>
                  }
                </ul>
              </div>
            </li>
          )
        })
      }
    </ul>
  );
}