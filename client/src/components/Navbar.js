import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

export default function Navbar() {
  return (
    <nav className='navbar navbar-dark bg-theme-800 shadow-sm'>
      <div className='container'>
        <Link to='/' className='navbar-brand font-primary'>PLEX Requests</Link>
        <Link to='/logout' className='btn btn-theme-accent'>Logout</Link>
      </div>
    </nav>
  );
}