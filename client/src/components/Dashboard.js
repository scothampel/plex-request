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
      <div className='container'>
        <Search token={token} setNewRequest={setNewRequest} />
        <Requests token={token} role={role} newRequest={newRequest} setNewRequest={setNewRequest} />
        {role === 'admin' && <Users token={token} />}
      </div>
    </>
  );
}