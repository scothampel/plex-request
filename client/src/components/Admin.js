import '../styles/Admin.css';
import Navbar from './Navbar';
import Users from './Users';

export default function Admin({ token, role }) {
  return (
    <>
      <Navbar role={role} />
      <div className='container admin'>
        <Users token={token} />
      </div>
    </>
  );
}