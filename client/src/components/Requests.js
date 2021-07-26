import { useEffect, useState } from 'react';
import '../styles/Requests.css';

export default function Requests({ token }) {
  const [requests, setRequests] = useState([{title: 'Loading...', type: 'info'}]);

  // TODO: fetches every 4m55s because of token refresh, probably change this
  useEffect(() => {
    fetch('/user/requests', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setRequests(data)
      })
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