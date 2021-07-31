import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

export default function Navbar() {
  return (
    <nav className='navbar navbar-light bg-light shadow-sm'>
      <div className='container'>
        <Link to='/' className='navbar-brand'>Plex Requests</Link>
        <Link to='/logout' className='btn btn-primary'>Logout</Link>
      </div>
    </nav>
  );
}