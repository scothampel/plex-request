import '../styles/Result.css';

export default function Result({ info, token }) {
  // Destructure info prop
  const { title, type, year, poster } = info;

  const handleClick = e => {
    // Make request
    fetch('/user/request', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-type': 'application/json'
      },
      body: JSON.stringify({ title, type, year })
    })
      .then(res => res.json())
      .then(data => {
        // TODO: proper alerts
        const { status, message } = data;
        if (status !== -1) {
          alert(message);
        }
      })
      .catch(err => console.error('Could not fetch', err));
  }

  return (
    <div className='mb-3 row'>
      <img src={poster} className='col-2' alt='poster'></img>
      <div className='col-8'>
        <h3>{title}</h3>
        <p><i>{year}</i></p>
        <span className='badge bg-primary'>{type.toUpperCase()}</span>
      </div>
      <div className='col-2 d-flex flex-column justify-content-center'>
        <button className='btn btn-success' onClick={handleClick}>Request</button>
      </div>
    </div>
  );
}