import { useState } from 'react';
import { BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import '../css/App.css';

function App() {
  const [token, setToken] = useState();

  return (
    <Router>
      <Switch>
        <Route path='/login'>
          <Login onLogin={setToken} />
        </Route>
        <Route path='/register'>
          <Register />
        </Route>
        <Route path='/'>
          Index
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
