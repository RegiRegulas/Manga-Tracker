import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import RequireAuth from "./components/RequireAuth.jsx";

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  console.log("Current token:", token);

  useEffect(() => {
    if (token) localStorage.setItem("token", token);
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <RequireAuth>
              <div className="container mx-auto px-4">
                <Dashboard
                  onLogout={() => {
                    setToken(null);
                    localStorage.removeItem("token");
                  }}
                />
              </div>
            </RequireAuth>
          }
        />

        <Route path="/login" element={<Login onLogin={setToken} />} />
        <Route
          path="/register"
          element={
            <Register onRegister={() => (window.location.href = "/login")} />
          }
        />
        <Route path="*" element={<Navigate to={token ? "/" : "/login"} />} />
      </Routes>
    </Router>
  );
};

export default App;
