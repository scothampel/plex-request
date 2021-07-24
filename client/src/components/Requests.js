import { useEffect, useState } from 'react';
import '../styles/Requests.css';

export default function Requests({ token }) {
  const [requests, setRequests] = useState([{title: 'Loading...', type: 'info'}]);

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
  }, [token])

  return (
    <ul className="list-group">
      {
          requests.map((val, index) => {
            const { title, type, year } = val;
            // Loading state
            if (type === 'info') {
              return <li key={index} className='list-group-item'>{title}</li>
            }
            return <li key={index} className='list-group-item'><b>{title}</b> <i>{year || ''}</i><span className={'badge float-end ' + (type === 'tv' ? 'bg-success' : 'bg-primary')}>{type.toUpperCase()}</span></li>
          })
        }
    </ul>
  );
}