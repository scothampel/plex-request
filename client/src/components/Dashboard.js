import '../styles/Dashboard.css';
import Navbar from './Navbar';
import Requests from './Requests';
import Search from './Search';
import Users from './Users';

export default function Dashboard({ token, role }) {
  return (
    <>
      <Navbar />
      <div className='container'>
        <Search token={token} />
        <Requests token={token} role={role} />
        {role === 'admin' && <Users token={token} />}
      </div>
    </>
  );
}