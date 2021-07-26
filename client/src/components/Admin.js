import '../styles/Admin.css';
import Navbar from './Navbar';

export default function Admin({ token, role }) {
  return (
    <>
      <Navbar role={role} />
      <div className='container admin'>

      </div>
    </>
  );
}