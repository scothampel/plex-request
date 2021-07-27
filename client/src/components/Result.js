import '../styles/Result.css';

export default function Result({ info, token, setNewRequest }) {
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
        // Set _id to object id
        const _id = message.insertedId
        // Tell requests the new request
        if (status === 1) {
          setNewRequest({ title, type, year, _id });
        }
      })
      .catch(err => console.error('Could not fetch', err));
  }

  return (
    <div className='result row py-2 px-3'>
      {type === 'info' && <h1>{title}</h1>}
      {
        type !== 'info' &&
        <>
          {/* TODO: Handle null poster */}
          <div className='col-md-2 d-none d-md-block text-center'>
            <img src={poster} alt='poster'></img>
          </div>
          <div className='col-8'>
            <span className='d-block'><span className='h6'>{title} </span><i>{year}</i></span>
            <span className={'badge ' + (type === 'tv' ? 'bg-danger' : 'bg-primary')}>{type.toUpperCase()}</span>
          </div>
          <div className='col-4 col-md-2 d-flex flex-column justify-content-center'>
            <button className='btn btn-success' onClick={handleClick}>Request</button>
          </div>
        </>
      }
    </div>
  );
}