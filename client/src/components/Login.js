import '../css/Login.css';

export default function Login() {
  const handleSubmit = e => {
    e.preventDefault();

    const user = e.target[0].value;
    const pass = e.target[1].value;

    fetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({user, pass}),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(dat => console.log(dat));
  }

  return (
    <div className='container' id='login'>
      <form onSubmit={handleSubmit}>
        <div className='mb-3'>
          <label htmlFor='user' className='form-label'>Username</label>
          <input type='text' className='form-control' id='user' name='user' required/>
        </div>
        <div className='mb-3'>
          <label htmlFor='pass' className='form-label'>Password</label>
          <input type='password' className='form-control' id='pass' name='pass' required/>
        </div>
        <button type="submit" className="btn btn-primary">Login</button>
      </form>
    </div>
  )
}
