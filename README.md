# FitTrack 🏋️

A full-stack workout tracking app built with React, TypeScript, and Express + MongoDB. Log workouts, track volume, and monitor your streak — all from a clean, minimal UI.

---

## Features

- **Log workouts** with a custom title, exercises, sets, reps, and weight
- **Inline editing** — edit any exercise in place without deleting and re-entering
- **Workout history** — view past workouts with date, total volume, and exercise breakdown
- **Stats bar** — tracks total workouts, this week's count, total volume lifted, and current streak
- **Persistent storage** — all data saved to MongoDB via a REST API

## Tech Stack

**Frontend**
- React + TypeScript (Vite)
- Tailwind CSS + shadcn/ui
- Framer Motion

**Backend**
- Node.js + Express
- MongoDB + Mongoose

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas URI)

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/fittrack.git
cd fittrack
```

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server && npm install
```

### Environment Variables

Create a `.env` file inside the `server/` directory:

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
```

Create a `.env` file in the root for the frontend:

```env
VITE_API_BASE_URL=http://localhost:5000
```

### Running the App

```bash
# Start the backend (from /server)
node server.js

# Start the frontend (from root)
npm run dev
```

The app will be available at `http://localhost:5173`.

## Project Structure

```
fittrack/
├── src/
│   ├── components/
│   │   ├── AddWorkoutForm.tsx   # Form to log a new workout
│   │   ├── WorkoutHistory.tsx   # List of past workouts with inline editing
│   │   └── StatsBar.tsx         # Summary stats (volume, streak, etc.)
│   ├── types/
│   │   └── workout.ts           # Workout and Exercise TypeScript interfaces
│   └── App.tsx                  # Root component, API calls, state management
└── server/
    └── server.js                # Express API + Mongoose model
```
