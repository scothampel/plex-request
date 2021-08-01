import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Login.css';

export default function Login({ setToken, role, setRole, setNeedLogin, refreshTimer, setRefreshTimer }) {
  // Stop refreshing token if trying to login
  // Also handles stop on logout
  useEffect(() => {
    clearInterval(refreshTimer);
    setRefreshTimer(null);
  });

  const handleSubmit = e => {
    // Prevent submission
    e.preventDefault();

    // Get username and password from form
    const user = e.target[0].value;
    const pass = e.target[1].value;

    // Attempt login
    fetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ user, pass }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => {
        // TODO: proper alerts
        const { status, message } = data;
        switch (status) {
          // Successful login
          case 1:
            // Set token
            setToken(message.token)
            setRole(message.role)
            // Needed for when unconfirmed user relogs after confirmation
            setNeedLogin(false);

            // Prevent loop on unconfirmed user
            if (message.role === 'unconfirmed') {
              setNeedLogin(true);
            }
            break;
          // Bad input case 0, server error case -1
          default:
            console.error(message);
            break;
        }
      })
      .catch(err => console.error('Could not login', err));
  }

  return (
    <div className='container py-3' id='login'>
      <ul className='list-group shadow-accent'>
        <li className='list-group-item text-white bg-theme-800'>
          <form onSubmit={handleSubmit} className='mb-3'>
            <div className='mb-3'>
              <label htmlFor='user' className='form-label font-primary'>USERNAME</label>
              <input type='text' className='form-control text-white bg-theme-700' id='user' name='user' required />
            </div>
            <div className='mb-3'>
              <label htmlFor='pass' className='form-label font-primary'>PASSWORD</label>
              <input type='password' className='form-control text-white bg-theme-700' id='pass' name='pass' required />
            </div>
            <button type="submit" className="btn btn-theme-accent me-3">Login</button>
            <Link to='/register' className='link-light'>Need an Account? Register here</Link>
          </form>
        </li>
      </ul>
      {/* Confirmation needed message */}
      {role === 'unconfirmed' && <div className='alert alert-warning'>Please have an admin confirm your account. Then login again.</div>}
    </div>
  )
}
