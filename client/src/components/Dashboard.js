import '../styles/Dashboard.css';
import Requests from './Requests';
import Search from './Search';

export default function Dashboard({ token }) {
  return (
    <div className='container'>
      <Search token={token} />
      <Requests token={token} />
    </div>
  );
}