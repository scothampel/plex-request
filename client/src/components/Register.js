import '../styles/Register.css';
import { Link, Redirect } from 'react-router-dom';
import { useEffect, useState } from 'react';

// TODO: redirect on register
export default function Register() {
  const [registered, setRegistered] = useState(false);

  // Reset registered
  useEffect(() => {
    setRegistered(false);
  }, [setRegistered])

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
        // TODO: proper alerts
        const { status, message } = data;
        switch (status) {
          // Successful register
          case 1:
            alert('Successfully registered!');
            // Set registered so user is redirected to login
            setRegistered(true);
            break;
          // Bad input case 0, server error case -1
          default:
            console.error(message);
            break;
        }
      })
      .catch(err => console.error('Could not register', err));
  }

  return (
    <>
      {/* Redirect if registered */}
      {registered && <Redirect to='/login' />}
      {
        !registered &&
        <div className='container py-3' id='login'>
          <ul className='list-group shadow-accent'>
            <li className='list-group-item text-white bg-theme-800'>
              <form onSubmit={handleSubmit}>
                <div className='mb-3'>
                  <label htmlFor='name' className='form-label font-primary'>NAME</label>
                  <input type='text' className='form-control text-white bg-theme-700' id='name' name='name' required />
                </div>
                <div className='mb-3'>
                  <label htmlFor='user' className='form-label font-primary'>USERNAME</label>
                  <input type='text' className='form-control text-white bg-theme-700' id='user' name='user' required />
                </div>
                <div className='mb-3'>
                  <label htmlFor='pass' className='form-label font-primary'>PASSWORD</label>
                  <input type='password' className='form-control text-white bg-theme-700' id='pass' name='pass' required />
                </div>
                <button type="submit" className="btn btn-theme-accent me-3">Register</button>
                <Link to='/login' className='link-light'>Already have an Account? Login here</Link>
              </form>
            </li>
          </ul>
        </div>
      }
    </>
  )
}
