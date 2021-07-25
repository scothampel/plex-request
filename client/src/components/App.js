import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect, Link } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Logout from './Logout';
import '../styles/App.css';
import Dashboard from './Dashboard';

function App() {
  const [token, setToken] = useState();
  const [loading, setLoading] = useState(true);
  // Can't only use token as login needed
  // Refresh token could have exp while window is open
  const [needLogin, setNeedLogin] = useState(false);

  // Pull new token if refesh cookie is set (logged in)
  // Can not check for refresh cookie, as it is httpOnly
  useEffect(() => {
    // Async/await because of fetch
    const refreshToken = async () => {
      // Only try to refresh if already logged in
      if (!needLogin) {
        await fetch('/auth/refresh', { method: 'POST' })
          .then(res => res.json())
          .then(data => {
            const { status, message } = data
            // Check if auth token is returned
            if (status === 1) {
              setToken(message)
            }
            // No token returned, need to login again
            else {
              setNeedLogin(true);
            }
          })
          .catch(err => console.error('Could not fetch', err));
      }
    }

    // First load, no token and page is loading
    if (!token && loading) {
      // Fetch new token
      refreshToken()
        .then(() => {
          // Fetch complete, allow proper components to render
          setLoading(false);
          // Interval of 4m55s to auto refresh token
          setInterval(() => {
            refreshToken()
          }, ((4 * 60) + 55) * 1000);
        })
    }
    // Deps set so this fetch only runs when visiting the page for the first time
    // Also runs on refresh, might also store auth token in a cookie to prevent this
  }, [token, loading, needLogin]);

  return (
    <Router>
      {/* TODO: Loading splash screen instead of text */}
      {loading ? 'Loading...' : ''}
      {
        // Refresh token still valid, and new token has been fetched
        !needLogin && !loading &&
        <Switch>
          <Route path='/login'>
            {token ? <Redirect to='/' /> : <Login setToken={setToken} setNeedLogin={setNeedLogin} />}
          </Route>
          <Route path='/register'>
            {token ? <Redirect to='/' /> : <Register />}
          </Route>
          <Route path='/logout'>
            {token ? <Logout setToken={setToken} setNeedLogin={setNeedLogin} /> : <Redirect to='/' />}
          </Route>
          <Route path='/'>
            {/* Temp for testing */}
            {token &&
              <div>
                <Dashboard token={token} />
              </div>
            }
            {!loading && !token && <Redirect to='/login' />}
          </Route>
        </Switch>
      }
      {
        // No redirect so route in url stays the same
        // Except for /logout, otherwise loop occurs
        // Except for /register, allow registration
        // When login is needed, ex. GET /request will just render <Login>
        // After login, main routes above will bring user back to /request 
        needLogin &&
        <Switch>
          <Route path='/logout'>
            <Redirect to='/login' />
          </Route>
          <Route path='/register'>
            <Register />
          </Route>
          <Route path='/'>
            <Login setToken={setToken} setNeedLogin={setNeedLogin} />
          </Route>
        </Switch>
      }
    </Router>
  );
}

export default App;
