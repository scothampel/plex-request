import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Logout from './Logout';
import '../styles/App.css';
import Dashboard from './Dashboard';

function App() {
  const [token, setToken] = useState();
  const [role, setRole] = useState();
  const [loading, setLoading] = useState(true);
  // Can't only use token as login needed
  // Refresh token could have exp while window is open
  const [needLogin, setNeedLogin] = useState(false);
  const [refreshTimer, setRefreshTimer] = useState(null);

  // Pull new token if refesh cookie is set (logged in)
  // Can not check for refresh cookie, as it is httpOnly
  useEffect(() => {
    const refreshToken = () => {
      // Only try to refresh if already logged in
      if (!needLogin) {
        fetch('/auth/refresh', { method: 'POST' })
          .then(res => res.json())
          .then(data => {
            const { status, message } = data
            // Check if auth token is returned
            if (status === 1) {
              setToken(message.token);
              setRole(message.role);
            }
            // No token returned, need to login again
            else {
              setNeedLogin(true);
            }
            
            // Fetch complete, allow proper components to render
            setLoading(false);
          })
          .catch(err => console.error('Could not fetch', err));
      }
    }

    // Curretly not refreshing and logged in
    if (!refreshTimer && !needLogin) {
      // Interval of 4m55s to auto refresh token
      // Store interval so login can cancel it
      setRefreshTimer(setInterval(() => {
        refreshToken()
      }, ((4 * 60) + 55) * 1000))

      // First page load
      if (!token) {
        // Fetch new token
        refreshToken()
      }
    }
    // Deps set so this fetch only runs when visiting the page for the first time
    // Also runs on refresh, might also store auth token in a cookie to prevent this
  }, [token, loading, needLogin, refreshTimer]);

  return (
    <Router>
      {/* TODO: Loading splash screen instead of text */}
      {loading ? 'Loading...' : ''}
      {
        // Refresh token still valid, and new token has been fetched
        !needLogin && !loading && role !== 'unconfirmed' &&
        <Switch>
          <Route path='/login'>
            {token ? <Redirect to='/' /> : <Login setToken={setToken} role={role} setRole={setRole} setNeedLogin={setNeedLogin} refreshTimer={refreshTimer} setRefreshTimer={setRefreshTimer} />}
          </Route>
          <Route path='/register'>
            {token ? <Redirect to='/' /> : <Register />}
          </Route>
          <Route path='/logout'>
            {token ? <Logout setToken={setToken} setRole={setRole} setNeedLogin={setNeedLogin} /> : <Redirect to='/' />}
          </Route>
          <Route path='/'>
            {token ? <Dashboard token={token} role={role} /> : <Redirect to='/login' />}
          </Route>
        </Switch>
      }
      {
        // No redirect so route in url stays the same
        // Except for /logout, otherwise loop occurs
        // Except for /register, allow registration
        // When login is needed, ex. GET /request will just render <Login>
        // After login, main routes above will bring user back to /request 
        (needLogin || role === 'unconfirmed') &&
        <Switch>
          <Route path='/logout'>
            <Redirect to='/login' />
          </Route>
          <Route path='/register'>
            <Register />
          </Route>
          <Route path='/'>
            <Login setToken={setToken} role={role} setRole={setRole} setNeedLogin={setNeedLogin} refreshTimer={refreshTimer} setRefreshTimer={setRefreshTimer} />
          </Route>
        </Switch>
      }
    </Router>
  );
}

export default App;
