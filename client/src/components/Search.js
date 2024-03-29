import { useState } from 'react';
import '../styles/Search.css';
import Result from './Result';

export default function Search({ token, setNewRequest }) {
  const [timer, setTimer] = useState();
  const [results, setResults] = useState([]);

  const handleChange = (e) => {
    setResults([{ title: 'Loading...', type: 'info' }]);
    // Get search query and encode
    const title = encodeURIComponent(e.target.value);

    // Clear timeout if it already exists
    if (timer) clearTimeout(timer);

    // Only start timer if length there is a query
    if (title.length !== 0) {
      // Set timer state var with timeout id
      // setTimeout used to prevent multiple requests to /user/search
      setTimer(setTimeout(() => {
        fetch(`/user/search?q=${title}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
          .then(res => res.json())
          .then(data => {
            const { status, message } = data;
            // Request successful, show results
            if (status === 1) {
              setResults(message);
            }
            else {
              setResults([{ title: 'No results found', type: 'info' }]);
            }
          })
          .catch(err => console.error('Could not search', err));
      }, 750));
    }
    // Empty query
    else {
      // Remove loading message
      setResults([]);
    }
  }

  return (
    <ul className='list-group search shadow-accent'>
      <li className='list-group-item text-white bg-theme-800'><h3>Search</h3></li>
      <input type='text' className='list-group-item text-white bg-theme-700 border-dark' onChange={handleChange} placeholder='ex. Rick and Morty' />
      {
        results.map((val, index) => {
          return (
            <li key={index} className='list-group-item text-white bg-theme-700 border-dark'>
              <Result info={val} token={token} setNewRequest={setNewRequest} />
            </li>
          )
        })
      }
    </ul>
  );
}