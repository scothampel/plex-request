import logo from './logo.svg';
import './App.css';
import { useState, useEffect} from 'react';

function App() {
  const [data, setData] = useState();

  useEffect(() => {
    fetch('/api')
      .then(res => res.json())
      .then(data => setData(data));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          {!data ? 'Loading...' : data.token}
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
