import { useState, useEffect } from "react";
import { Dumbbell } from "lucide-react";
import AddWorkoutForm from "@/components/AddWorkoutForm";
import StatsBar from "@/components/StatsBar";
import WorkoutHistory from "@/components/WorkoutHistory";
import type { Workout } from "@/types/workout";

export default function App() {
  // 1. Load data from LocalStorage on startup
  const [workouts, setWorkouts] = useState<Workout[]>(() => {
    const saved = localStorage.getItem("workout-tracker-data");
    return saved ? JSON.parse(saved) : [];
  });

  // 2. Save data whenever it changes
  useEffect(() => {
    localStorage.setItem("workout-tracker-data", JSON.stringify(workouts));
  }, [workouts]);

  const handleAddWorkout = (newWorkout: Workout) => {
    setWorkouts([newWorkout, ...workouts]);
  };

  const handleDeleteWorkout = (id: string) => {
    setWorkouts(workouts.filter((w) => w.id !== id));
  };

  // 3. Calculate Stats
  const totalVolume = workouts.reduce((acc, w) => {
    return acc + w.exercises.reduce((eAcc, e) => eAcc + (e.sets * e.reps * e.weight), 0);
  }, 0);

  const thisWeekCount = workouts.filter((w) => {
    const workoutDate = new Date(w.date);
    const now = new Date();
    const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));
    return workoutDate > oneWeekAgo;
  }).length;

  return (
    <div className="min-h-screen bg-background text-foreground font-body p-4 sm:p-8">
      <div className="mx-auto max-w-3xl space-y-8">
        
        {/* Header */}
        <header className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-primary rounded-xl shadow-glow">
            <Dumbbell className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-heading font-bold tracking-tight">FitTrack</h1>
            <p className="text-muted-foreground">Monitor your progress</p>
          </div>
        </header>

        {/* Stats Dashboard */}
        <section>
          <StatsBar 
            totalWorkouts={workouts.length} 
            thisWeek={thisWeekCount} 
            totalVolume={totalVolume} 
          />
        </section>

        {/* Main Actions */}
        <section>
          <AddWorkoutForm onAdd={handleAddWorkout} />
        </section>

        {/* History List */}
        <section>
          <WorkoutHistory workouts={workouts} onDelete={handleDeleteWorkout} />
        </section>

      </div>
    </div>
  );
}