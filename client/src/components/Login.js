import { Link } from 'react-router-dom';
import '../styles/Login.css';

export default function Login({ setToken, role, setRole, setNeedLogin }) {
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
            setNeedLogin(false);
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
    <div className='container' id='login'>
      <form onSubmit={handleSubmit} className='mb-3'>
        <div className='mb-3'>
          <label htmlFor='user' className='form-label'>Username</label>
          <input type='text' className='form-control' id='user' name='user' required />
        </div>
        <div className='mb-3'>
          <label htmlFor='pass' className='form-label'>Password</label>
          <input type='password' className='form-control' id='pass' name='pass' required />
        </div>
        <button type="submit" className="btn btn-primary me-3">Login</button>
        <Link to='/register'>Need an Account? Register here</Link>
      </form>
        {/* Confirmation needed message */}
        { role === 'unconfirmed' && <div className='alert alert-warning'>Please have an admin confirm your account. Then login again.</div> }
    </div>
  )
}
