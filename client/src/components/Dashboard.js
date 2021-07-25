import '../styles/Dashboard.css';
import Navbar from './Navbar';
import Requests from './Requests';
import Search from './Search';

export default function Dashboard({ token }) {
  return (
    <div>
      <Navbar />
      <div className='container'>
        <Search token={token} />
        <Requests token={token} />
      </div>
    </div>
  );
}