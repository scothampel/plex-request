import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import Login from './Login';
import useLocalState from '../hooks/useLocalState';
import '../css/App.css';

function App() {
  const [user, setUser] = useLocalState();

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
