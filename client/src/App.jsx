import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Register from './pages/Register';
import Landing from './pages/Landing';
import DashboardHelper from './pages/DashboardHelper';
import JobList from './pages/JobList';
import CreateJob from './pages/CreateJob';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import Layout from './components/Layout';
import { AuthProvider } from './context/AuthContext.jsx';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes with simple navbar */}
          <Route path="/" element={
            <>
              <Navbar />
              <Landing />
            </>
          } />
          <Route path="/login" element={
            <>
              <Navbar />
              <Login />
            </>
          } />
          <Route path="/register" element={
            <>
              <Navbar />
              <Register />
            </>
          } />
          <Route path="/admin/login" element={
            <>
              <Navbar />
              <AdminLogin />
            </>
          } />

          {/* Authenticated routes with Layout (sidebar + topbar) */}
          <Route path="/dashboard" element={
            <Layout>
              <DashboardHelper />
            </Layout>
          } />
          {/* Admin Routes */}
          <Route path="/admin/users" element={
            <Layout>
              <DashboardHelper />
            </Layout>
          } />
          <Route path="/admin/alumni" element={
            <Layout>
              <DashboardHelper />
            </Layout>
          } />
          <Route path="/admin/students" element={
            <Layout>
              <DashboardHelper />
            </Layout>
          } />
          <Route path="/jobs" element={
            <Layout>
              <JobList />
            </Layout>
          } />
          <Route path="/jobs/create" element={
            <Layout>
              <CreateJob />
            </Layout>
          } />
          <Route path="/profile" element={
            <Layout>
              <Profile />
            </Layout>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
