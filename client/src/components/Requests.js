import { useEffect, useState } from 'react';
import '../styles/Requests.css';

export default function Requests({ token, role, newRequest, setNewRequest }) {
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
          // Check for returned results
          if (status === 1 && message.length !== 0) {
            setRequests(message);
          }
          // TODO: Probably do this differently
          // Prevent render loop
          else if (requests[0].title !== 'There are currently no requests') {
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

    // Prevent most recent request from reappearing
    setNewRequest(null)

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
    <ul className="list-group shadow-accent">
      <li className='list-group-item text-white bg-theme-800'><h3>Current Requests</h3></li>
      {
        requests.map((val, index) => {
          const { _id, title, type, year } = val;
          // Loading state
          if (type === 'info') {
            return <li key={index} className='list-group-item text-white bg-theme-700 border-dark'>{title}</li>
          }
          return (
            <li key={index} className='list-group-item text-white bg-theme-700 border-dark'>
              <b>{title} </b>
              <i>{year || ''}</i>
              <div className='d-inline-flex float-end align-items-center'>
                <span className={'badge ' + (type === 'tv' ? 'bg-danger' : 'bg-primary')}><span className='align-text-bottom'>{type.toUpperCase()}</span></span>
                {role === 'admin' && <button type='button' className='btn btn-sm btn-warning ms-3' onClick={handleClick} data-id={_id} >Remove</button>}
              </div>
            </li>
          )
        })
      }
    </ul>
  );
}