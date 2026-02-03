# Alumni Management Portal

A comprehensive web application connecting Students, Alumni, and Administrators for networking, job postings, mentorship, and events.

## 🚀 Tech Stack

**Backend:**
- Node.js + Express
- MongoDB (Mongoose ODM)
- JWT Authentication
- bcrypt for password hashing

**Frontend:**
- React (Vite)
- React Router
- Axios
- Vanilla CSS with CSS Variables

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas)
- npm or yarn

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd project_pbl
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/alumni_portal
JWT_SECRET=your_super_secret_key_change_this
```

**Start MongoDB** (if running locally):
```bash
# On Windows
mongod

# On Mac/Linux
sudo systemctl start mongod
```

**Start the backend server:**
```bash
npm run start
# or for development with auto-reload:
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

Open a new terminal:
```bash
cd client
npm install
```

**Start the frontend dev server:**
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## 🎯 Usage

### Access the Application
Open your browser and navigate to: `http://localhost:5173`

### User Roles

**Student:**
- Browse jobs and internships
- Apply to opportunities
- Search for alumni mentors
- View events

**Alumni:**
- Post job opportunities
- Mentor students
- Update professional profile
- Network with other alumni

**Admin:**
- Verify alumni accounts
- Manage users
- Create and manage events
- View analytics

### Testing the Application

1. **Register as a Student:**
   - Click "Join Network"
   - Fill in details with role: Student
   - You'll be auto-verified and redirected to Student Dashboard

2. **Register as Alumni:**
   - Click "Join Network"
   - Fill in details with role: Alumni
   - Account will be pending admin verification

3. **Post a Job (Alumni):**
   - Login as Alumni
   - Navigate to Jobs → Post a Job
   - Fill in job details

4. **Apply for Jobs (Student):**
   - Login as Student
   - Navigate to Jobs
   - Click "Apply" on any job listing

## 📁 Project Structure

```
project_pbl/
├── client/                 # Frontend (React)
│   ├── src/
│   │   ├── components/    # Reusable components (Navbar, etc.)
│   │   ├── pages/         # Page components
│   │   ├── context/       # React Context (Auth)
│   │   ├── utils/         # Utility functions
│   │   ├── App.jsx        # Main App component
│   │   └── index.css      # Global styles
│   └── package.json
│
└── server/                # Backend (Node.js + Express)
    ├── controllers/       # Route controllers
    ├── models/           # Mongoose models
    ├── routes/           # API routes
    ├── middleware/       # Auth middleware
    ├── server.js         # Entry point
    └── package.json
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users` - Get all verified users
- `GET /api/users/:id` - Get user by ID

### Jobs
- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Create job (Alumni only)
- `GET /api/jobs/:id` - Get job by ID
- `POST /api/jobs/:id/apply` - Apply to job (Student only)

## 🎨 Features Implemented

✅ User Authentication (Register/Login)
✅ Role-based Access Control (Student/Alumni/Admin)
✅ Profile Management
✅ Job Posting & Application System
✅ Responsive Design
✅ Alumni Verification Workflow

## 🚧 Upcoming Features

- Events & Reunions Management
- Mentorship Program
- Real-time Chat System
- Notifications
- Search & Filter Alumni
- Analytics Dashboard

## 🐛 Troubleshooting

**MongoDB Connection Error:**
- Ensure MongoDB is running
- Check MONGO_URI in `.env` file

**Port Already in Use:**
- Change PORT in server `.env` file
- Update API URLs in frontend if needed

**CORS Errors:**
- Ensure backend server is running
- Check that frontend is making requests to correct backend URL

## 📝 License

This project is for educational purposes.
