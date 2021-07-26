import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

export default function Navbar({ role }) {
  return (
    <nav className='navbar navbar-light bg-light mb-3'>
      <div className='container-fluid'>
        <Link to='/' className='navbar-brand'>Plex Requests</Link>
        <div>
          {role === 'admin' && <Link to='/admin' className='btn btn-danger me-3'>Admin</Link>}
          <Link to='/logout' className='btn btn-primary'>Logout</Link>
        </div>
      </div>
    </nav>
  );
}