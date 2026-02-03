import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import DashboardHelper from './pages/DashboardHelper';
import JobList from './pages/JobList';
import CreateJob from './pages/CreateJob';
import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<DashboardHelper />} />
            <Route path="/jobs" element={<JobList />} />
            <Route path="/jobs/create" element={<CreateJob />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
