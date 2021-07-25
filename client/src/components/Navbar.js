import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

export default function Navbar() {
  return (
    <nav className='navbar navbar-light bg-light'>
      <div className='container-fluid'>
        <Link to='/' className='navbar-brand'>Plex Requests</Link>
        <Link to='/logout' className='btn btn-primary float-end'>Logout</Link>
      </div>
    </nav>
  );
}