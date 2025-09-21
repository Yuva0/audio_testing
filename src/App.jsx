import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './pages/Homepage';
import Admin from './pages/Admin';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/admin" element={<Admin />} />
        {/* Add routes for Playground and Production as needed */}
      </Routes>
    </Router>
  );
};

export default App;
