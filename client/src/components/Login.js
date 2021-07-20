import '../css/Login.css';

export default function Login() {
  const handleSubmit = e => {
    e.preventDefault();
    console.log(e);
    fetch('/auth/login', {method: 'POST'})
      .then(res => res.text())
      .then(dat => console.log(dat))
  }

  return (
    <div className='container' id='login'>
      <form onSubmit={handleSubmit}>
        <div className='mb-3'>
          <label htmlFor='user' className='form-label'>Username</label>
          <input type='text' className='form-control' id='user' name='user' />
        </div>
        <div className='mb-3'>
          <label htmlFor='pass' className='form-label'>Password</label>
          <input type='password' className='form-control' id='pass' name='pass' />
        </div>
        <button type="submit" className="btn btn-primary">Login</button>
      </form>
    </div>
  )
}
