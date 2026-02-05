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
import StudentAuth from './pages/StudentAuth';
import AlumniAuth from './pages/AlumniAuth';
import MentorshipList from './pages/MentorshipList';
import MentorshipRequests from './pages/MentorshipRequests';
import StudentManagement from './pages/admin/StudentManagement';
import StudentDetailView from './pages/admin/StudentDetailView';
import AlumniDetailView from './pages/admin/AlumniDetailView';
import MentorshipConversation from './pages/MentorshipConversation';
import MentorshipChatList from './pages/MentorshipChatList';
import MenteeDetailView from './pages/MenteeDetailView';

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
          <Route path="/auth/student" element={
            <>
              <Navbar />
              <StudentAuth />
            </>
          } />
          <Route path="/auth/alumni" element={
            <>
              <Navbar />
              <AlumniAuth />
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
              <StudentManagement />
            </Layout>
          } />
          <Route path="/admin/students/:id" element={
            <Layout>
              <StudentDetailView />
            </Layout>
          } />
          <Route path="/admin/alumni/:id" element={
            <Layout>
              <AlumniDetailView />
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
          <Route path="/mentorship" element={
            <Layout>
              <MentorshipList />
            </Layout>
          } />
          <Route path="/mentorship/requests" element={
            <Layout>
              <MentorshipRequests />
            </Layout>
          } />
          <Route path="/mentorship/chats" element={
            <Layout>
              <MentorshipChatList />
            </Layout>
          } />
          <Route path="/mentorship/conversation/:id" element={
            <Layout>
              <MentorshipConversation />
            </Layout>
          } />
          <Route path="/mentee/:id" element={
            <Layout>
              <MenteeDetailView />
            </Layout>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
