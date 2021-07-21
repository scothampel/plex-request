import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect, Link } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Logout from './Logout';
import '../css/App.css';

function App() {
  const [token, setToken] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token && loading) {
      fetch('/auth/refresh', {
        method: 'POST'
      })
        .then(res => res.json())
        .then(data => {
          const { status, message } = data
          if (status === 1) {
            setToken(message)
          }
          setLoading(false);
        })
        .catch(err => console.error('Internal Server Error', err));
    }
  }, [token, loading]);

  return (
    <Router>
      <Switch>
        <Route path='/login'>
          {loading ? 'Loading...' : token ? <Redirect to='/' /> : <Login setToken={setToken} />}
        </Route>
        <Route path='/register'>
          <Register />
        </Route>
        <Route path='/logout'>
          {token ? <Logout setToken={setToken} /> : <Redirect to='/' />}
        </Route>
        <Route path='/'>
          {loading && 'Loading...'}
          {!loading && token &&
            <div>
              <Link to='/login'>Login</Link>
              <Link to='/register'>Register</Link>
              <Link to='/logout'>Logout</Link>
            </div>
          }
          {!loading && !token && <Redirect to='/login' />}
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
