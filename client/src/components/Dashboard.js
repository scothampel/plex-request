import { useState } from 'react';
import '../styles/Dashboard.css';
import Navbar from './Navbar';
import Requests from './Requests';
import Search from './Search';
import Users from './Users';

export default function Dashboard({ token, role }) {
  // Track if new request is made
  const [newRequest, setNewRequest] = useState(null);

  return (
    <>
      <Navbar />
      <div className='container py-3'>
        <div className='row row-cols-1 gy-3'>
          <div className='col'>
            <Search token={token} setNewRequest={setNewRequest} />
          </div>
          <div className='col'>
            <Requests token={token} role={role} newRequest={newRequest} setNewRequest={setNewRequest} />
          </div>
          <div className='col'>
            {role === 'admin' && <Users token={token} />}
          </div>
        </div>
      </div>
    </>
  );
}