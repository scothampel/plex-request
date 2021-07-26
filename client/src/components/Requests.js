import { useEffect, useState } from 'react';
import '../styles/Requests.css';

export default function Requests({ token, role, newRequest }) {
  const [requests, setRequests] = useState([{ title: 'Loading...', type: 'info' }]);

  useEffect(() => {
    // Check if no requests have been fetched yet
    // Stops fetch on token refresh
    // Doesn't prevent if there are no requests, non-issue really
    if (requests[0].type === 'info') {
      fetch('/user/requests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          const { status, message } = data;
          if (status === 1) {
            setRequests(message);
          }
          else {
            setRequests([{ title: 'There are currently no requests', type: 'info' }]);
          }
        })
    }
  }, [token, requests])

  // Update requests after current user makes request
  useEffect(() => {
    if (newRequest) {
      // Check if request already exists in list
      if (requests.filter(val => val.title === newRequest.title && val.type === newRequest.type).length === 0) {
        setRequests([...requests, newRequest]);
      }
    }
  }, [requests, newRequest])

  const handleClick = e => {
    // Get request id from target dataset
    const { id } = e.target.dataset;

    fetch('/admin/request', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-type': 'application/json'
      },
      body: JSON.stringify({ id })
    })
      .then(res => res.json())
      .then(data => {
        const { status, message } = data;

        if (status === 1) {
          // Update request list on front-end
          setRequests(requests.filter(val => val._id !== id));
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
      <li className='list-group-item bg-light'><h3>Current Requests</h3></li>
      {
        requests.map((val, index) => {
          const { _id, title, type, year } = val;
          // Loading state
          if (type === 'info') {
            return <li key={index} className='list-group-item'>{title}</li>
          }
          return (
            <li key={index} className='list-group-item'>
              <b>{title} </b>
              <i>{year || ''}</i>
              {role === 'admin' && <button type='button' className='btn btn-sm btn-warning float-end ms-3' onClick={handleClick} data-id={_id} >Remove</button>}
              <span className={'badge float-end ' + (type === 'tv' ? 'bg-danger' : 'bg-primary')}>{type.toUpperCase()}</span>
            </li>
          )
        })
      }
    </ul>
  );
}