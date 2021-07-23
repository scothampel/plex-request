import '../styles/Register.css';

export default function Register() {
  const handleSubmit = e => {
    // Prevent submission
    e.preventDefault();

    // Get username and password from form
    const name = e.target[0].value;
    const user = e.target[1].value;
    const pass = e.target[2].value;

    // Attempt login
    fetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, user, pass }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => {
        const { status, message } = data;
        switch (status) {
          // Successful register
          case 1:
            // TODO: HTML alert
            alert('Successfully registered!');
            break;
          // Bad input
          case 0:
            console.error(message);
            break;
          // Server error
          default:
            console.error('Internal Server Error', message);
            break;
        }
      })
      .catch(err => console.error('Internal Server Error', err));
  }

  return (
    <div className='container' id='login'>
      <form onSubmit={handleSubmit}>
        <div className='mb-3'>
          <label htmlFor='name' className='form-label'>Name</label>
          <input type='text' className='form-control' id='name' name='name' required />
        </div>
        <div className='mb-3'>
          <label htmlFor='user' className='form-label'>Username</label>
          <input type='text' className='form-control' id='user' name='user' required />
        </div>
        <div className='mb-3'>
          <label htmlFor='pass' className='form-label'>Password</label>
          <input type='password' className='form-control' id='pass' name='pass' required />
        </div>
        <button type="submit" className="btn btn-primary">Register</button>
      </form>
    </div>
  )
}