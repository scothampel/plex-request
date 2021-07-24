import { useState } from 'react';
import '../styles/Search.css';
import Result from './Result';

export default function Search({ token }) {
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
    <div>
      <div className='mb-3'>
        <label htmlFor='search' className='form-label'>Search</label>
        <input type='text' className='form-control' onChange={handleChange} id='search' name='search' />
      </div>
      <div className='mb-3 container'>
        {
          results.map((val, index) => {
            return <Result key={index} info={val} token={token} />
          })
        }
      </div>
    </div>
  );
}