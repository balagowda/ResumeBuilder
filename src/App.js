import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import './App.css';
import HomePage from './components/HomePage';
import Template1 from './components/Template1';
import Template2 from './components/Template2';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div className="header-container">
          <h1 className="logo">Resume Builder</h1>
          <nav className="nav-menu">
            <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Home
            </NavLink>
            <NavLink to="/contact" className="nav-link">
              Contact
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="App-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/template1" element={<Template1 />} />
          <Route path="/template2" element={<Template2 />} />
          {/* Add more routes as needed */}
        </Routes>
      </main>
      <footer className="App-footer">
        <p>
          Contact us at: <a href="mailto:support@resumebuilder.com">support@resumebuilder.com</a>
        </p>
        <p>&copy; 2025 Resume Builder. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;