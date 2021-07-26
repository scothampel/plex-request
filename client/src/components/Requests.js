import { useEffect, useState } from 'react';
import '../styles/Requests.css';

export default function Requests({ token }) {
  const [requests, setRequests] = useState([{title: 'Loading...', type: 'info'}]);

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
  },[token])

  return (
    <ul className="list-group mb-3">
      <li className='list-group-item bg-light'><h3>Current Requests</h3></li>
      {
          requests.map((val, index) => {
            const { title, type, year } = val;
            // Loading state
            if (type === 'info') {
              return <li key={index} className='list-group-item'>{title}</li>
            }
            return <li key={index} className='list-group-item'><b>{title}</b> <i>{year || ''}</i><span className={'badge float-end ' + (type === 'tv' ? 'bg-danger' : 'bg-primary')}>{type.toUpperCase()}</span></li>
          })
        }
    </ul>
  );
}