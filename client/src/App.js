import { useState } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import Login from './components/Login';
import './css/App.css';

function App() {
  const [user, setUser] = useState();

  return (
    <Router>
      <Switch>
        <Route path='/login'>
          <Login />
        </Route>
        <Route path='/register'>
          Register
        </Route>
        <Route path='/'>
          Index
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
