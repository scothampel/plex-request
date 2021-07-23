import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect, Link } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Logout from './Logout';
import '../styles/App.css';
import Search from './Search';

function App() {
  const [token, setToken] = useState();
  const [loading, setLoading] = useState(true);

  // Pull new token if refesh cookie is set (logged in)
  // Can not check for refresh cookie, as it is httpOnly
  useEffect(() => {
    // First load, no token and page is loading
    if (!token && loading) {
      // Fetch new token
      refreshToken()
      // Fetch complete, allow proper components to render
      setLoading(false);
    }
  // Deps set so this fetch only runs when visiting the page for the first time
  // Also runs on refresh, might also store auth token in a cookie to prevent this
  }, [token, loading]);

  const refreshToken = () => {
    fetch('/auth/refresh', {method: 'POST'})
        .then(res => res.json())
        .then(data => {
          const { status, message } = data
          // Check if auth token is returned
          if (status === 1) {
            setToken(message)
            return 1;
          }
          else {
            return 0;
          }
        })
        .catch(err => console.error('Could not fetch', err));
  }

  // TODO: Loading splash screen instead of text
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
        <Route path='/search'>
          <Search token={token} refreshToken={refreshToken} />
        </Route>
        <Route path='/'>
          {/* Temp for testing */}
          {loading && 'Loading...'}
          {!loading && token &&
            <div>
              <Link to='/login'>Login</Link>
              <Link to='/register'>Register</Link>
              <Link to='/logout'>Logout</Link>
              <Link to='/search'>Search</Link>
              {token}
            </div>
          }
          {!loading && !token && <Redirect to='/login' />}
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
