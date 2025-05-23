import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [showRegister, setShowRegister] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  if (!token) {
    return showRegister ? (
      <div>
        <Register onRegister={() => setShowRegister(false)} />
        <p>
          Already have an account?{' '}
          <button onClick={() => setShowRegister(false)}>Login here</button>
        </p>
      </div>
    ) : (
      <div>
        <Login onLogin={setToken} />
        <p>
          Don’t have an account?{' '}
          <button onClick={() => setShowRegister(true)}>Register here</button>
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1>Welcome to Manga Tracker</h1>
      <button onClick={handleLogout}>Logout</button>
      {/* Your protected content will go here */}
    </div>
  );
};

export default App;
