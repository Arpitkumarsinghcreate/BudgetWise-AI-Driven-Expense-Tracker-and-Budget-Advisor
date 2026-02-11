# AI Expense Track - Project Description

## Project Overview
AI Expense Track is a modern, single-page web application for tracking personal expenses with AI-powered insights. It's a React-based frontend application built with Vite, featuring user authentication, a dashboard interface, and a responsive design.

## Technology Stack

### Core Technologies
- **React**: ^19.2.0 (Latest version)
- **React DOM**: ^19.2.0
- **React Router DOM**: ^7.11.0 (For client-side routing)
- **Vite**: ^7.2.4 (Build tool and dev server)
- **Bootstrap**: ^5.3.8 (CSS framework)
- **React Bootstrap**: ^2.10.10 (React components for Bootstrap)

### Development Tools
- **ESLint**: ^9.39.1 (Code linting)
- **TypeScript Types**: @types/react, @types/react-dom (For type checking)
- **Vite React Plugin**: @vitejs/plugin-react

## Project Structure

```
expense-tracker/
└── frontend/
    ├── public/
    │   └── vite.svg
    ├── src/
    │   ├── components/          # Reusable UI components
    │   │   ├── Auth.css          # Authentication form styles
    │   │   ├── AuthLayout.css    # Auth page layout styles
    │   │   ├── AuthLayout.jsx    # Layout wrapper for auth pages
    │   │   ├── Login.jsx         # Login form component
    │   │   └── Signup.jsx        # Signup form component
    │   ├── pages/                # Page components
    │   │   ├── Dashboard.css     # Dashboard styles
    │   │   ├── Dashboard.jsx     # Main dashboard page
    │   │   ├── HomePage.css      # Landing page styles
    │   │   ├── HomePage.jsx      # Landing/marketing page
    │   │   ├── LoginPage.jsx     # Login page wrapper
    │   │   └── SignupPage.jsx    # Signup page wrapper
    │   ├── App.jsx               # Main app component with routing
    │   ├── App.css               # Global app styles
    │   ├── main.jsx              # Application entry point
    │   └── index.css             # Global CSS styles
    ├── index.html                # HTML template
    ├── package.json              # Dependencies and scripts
    ├── vite.config.js            # Vite configuration
    └── eslint.config.js          # ESLint configuration
```

## Key Features

### 1. Authentication System
- **User Registration**: Signup form with validation (name, email, password, confirm password)
- **User Login**: Email/password authentication
- **Session Management**: Uses localStorage to persist login state
- **Protected Routes**: Dashboard requires authentication
- **Credential Storage**: User credentials stored in localStorage (currently client-side only)

**Authentication Flow:**
- Signup: Stores user data in localStorage array, sets session flags
- Login: Validates credentials against stored users
- Logout: Clears session data and redirects to login

### 2. Landing Page (HomePage)
- **Hero Section**: Main call-to-action with Login/Signup buttons
- **Phone Mockup**: Visual preview of the mobile app interface
- **Benefits Section**: Highlights key features (AI-powered insights, quick tracking, analytics, security)
- **Features Section**: Detailed feature list (smart categorization, budget planning, reports, multi-currency)
- **How It Works**: Step-by-step guide
- **Smooth Scrolling**: Navigation between sections
- **Scroll Animations**: Intersection Observer for fade-in effects
- **Responsive Header**: Changes appearance on scroll

### 3. Dashboard
- **Welcome Section**: Personalized greeting with user's name
- **Statistics Cards**: 
  - Total Income
  - Total Expenses
  - Balance
- **Recent Transactions**: List of recent expense/income entries (currently empty state)
- **AI Insights**: AI-powered financial insights section (currently empty state)
- **Quick Actions**: Buttons for adding expenses, income, and generating reports
- **Logout Functionality**: Clear session and redirect to login
- **Scroll Header**: Header changes appearance when scrolling

### 4. Responsive Design
- Mobile-first approach
- Breakpoints at 768px and 480px
- Adaptive layouts for all screen sizes
- Touch-friendly buttons and inputs

## Routing Structure

The application uses React Router DOM with the following routes:

1. **`/`** - HomePage (Landing/Marketing page)
2. **`/login`** - LoginPage (Authentication)
3. **`/signup`** - SignupPage (User registration)
4. **`/dashboard`** - Dashboard (Protected route, requires authentication)

**Route Protection:**
- Dashboard route checks `localStorage.getItem("isLoggedIn") === "true"`
- Unauthenticated users are redirected to `/login`

## Component Details

### App.jsx
- Main application component
- Sets up BrowserRouter
- Defines all routes
- Implements route protection for dashboard
- Uses `isAuthenticated()` helper function

### HomePage.jsx
- Landing page with marketing content
- Smooth scroll navigation
- Intersection Observer for animations
- Multiple sections: Hero, Benefits, Features, How It Works
- Footer with navigation links

### Dashboard.jsx
- Protected route component
- Displays user financial overview
- Shows statistics (income, expenses, balance)
- Recent transactions list (ready for data integration)
- AI insights section (ready for data integration)
- Quick action buttons

### Login.jsx
- Login form component
- Email and password inputs
- "Remember me" checkbox
- "Forgot password" link
- Google social login button
- Form validation
- Error handling for invalid credentials
- Loading state during authentication

### Signup.jsx
- Registration form component
- Fields: Name, Email, Password, Confirm Password
- Password matching validation
- Terms & Conditions checkbox
- Google social login button
- Duplicate email checking
- Loading state during registration

### AuthLayout.jsx
- Wrapper component for auth pages
- Provides consistent layout
- Includes header with logo
- Decorative background elements
- Responsive container

## Styling Approach

### CSS Architecture
- **Component-scoped CSS**: Each component has its own CSS file
- **Global Styles**: `index.css` and `App.css` for base styles
- **Bootstrap Integration**: Bootstrap CSS imported in `main.jsx`
- **Custom CSS Variables**: Used for colors, spacing, and animations

### Design System
- **Primary Color**: Yellow/Gold gradient (#ffd700, #ffed4e)
- **Background**: Light gradient (beige to light yellow-green)
- **Typography**: Modern sans-serif fonts
- **Border Radius**: 10-24px for rounded corners
- **Shadows**: Subtle box shadows for depth
- **Animations**: Fade-in, slide-in, and hover effects

### Key Style Files
- `HomePage.css`: Landing page styles (hero, sections, animations)
- `Dashboard.css`: Dashboard layout and card styles
- `Auth.css`: Authentication form styles
- `AuthLayout.css`: Auth page layout and decorative elements

## Data Management

### Current Implementation
- **localStorage**: Used for:
  - User credentials storage (`users` array)
  - Session management (`isLoggedIn`, `userName`, `userEmail`)
- **No Backend**: Currently frontend-only, no API integration

### Data Structure
```javascript
// Users array in localStorage
[
  {
    email: "user@example.com",
    password: "password123",
    name: "User Name"
  }
]

// Session data
localStorage.setItem("isLoggedIn", "true")
localStorage.setItem("userName", "User Name")
localStorage.setItem("userEmail", "user@example.com")
```

## State Management

- **React Hooks**: useState, useEffect, useNavigate
- **Local State**: Component-level state management
- **No Global State**: No Redux or Context API currently
- **Session Persistence**: localStorage for authentication state

## Build & Development

### Scripts (package.json)
- `npm run dev`: Start development server (Vite)
- `npm run build`: Build for production
- `npm run lint`: Run ESLint
- `npm run preview`: Preview production build

### Development Server
- Runs on `localhost:5173` (default Vite port)
- Hot Module Replacement (HMR) enabled
- Fast refresh for React components

## Current Status

### Completed Features
✅ User registration and login
✅ Protected routes
✅ Landing page with marketing content
✅ Dashboard UI structure
✅ Responsive design
✅ Form validation
✅ Session management
✅ Logout functionality

### Pending Features (UI Ready, Needs Backend)
⏳ Expense/Income entry forms
⏳ Transaction list population
⏳ AI insights integration
⏳ Report generation
⏳ Budget planning
⏳ Data visualization/charts
⏳ Backend API integration

## Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ JavaScript features
- CSS Grid and Flexbox
- localStorage API

## Notes for Development
- The project is currently frontend-only
- Authentication is simulated using localStorage
- Dashboard shows placeholder/empty states for transactions and insights
- Ready for backend API integration
- All forms are functional but need API endpoints
- Responsive design is implemented but may need testing on various devices
