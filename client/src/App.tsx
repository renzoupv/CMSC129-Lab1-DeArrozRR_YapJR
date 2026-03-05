import { useState, useEffect } from "react";
import { Dumbbell } from "lucide-react";
import AddWorkoutForm from "@/components/AddWorkoutForm";
import StatsBar from "@/components/StatsBar";
import WorkoutHistory from "@/components/WorkoutHistory";
import type { Workout } from "@/types/workout";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function App() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // READ: load from backend on startup
  useEffect(() => {
    (async () => {
      try {
        setError(null);
        const res = await fetch(`${API_BASE}/api/workouts`);
        if (!res.ok) throw new Error(await res.text());
        const data = (await res.json()) as { workouts: Workout[] };
        setWorkouts(data.workouts ?? []);
      } catch (e: any) {
        setError(e.message || "Failed to load workouts");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // CREATE: add workout via backend
  const handleAddWorkout = async (newWorkout: Workout) => {
    try {
      setError(null);
      const res = await fetch(`${API_BASE}/api/workouts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newWorkout),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { workout: Workout };
      setWorkouts([data.workout, ...workouts]);
    } catch (e: any) {
      setError(e.message || "Failed to add workout");
    }
  };

  // UPDATE: edit workout via backend
  const handleUpdateWorkout = async (id: string, updatedWorkout: Workout) => {
    try {
      setError(null);
      const res = await fetch(`${API_BASE}/api/workouts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedWorkout),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { workout: Workout };
      setWorkouts(workouts.map(w => w.id === id ? data.workout : w));
    } catch (e: any) {
      setError(e.message || "Failed to update workout");
    }
  };

  // DELETE: delete workout via backend
  const handleDeleteWorkout = async (id: string) => {
    try {
      setError(null);
      const res = await fetch(`${API_BASE}/api/workouts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      setWorkouts(workouts.filter((w) => w.id !== id));
    } catch (e: any) {
      setError(e.message || "Failed to delete workout");
    }
  };

  // Stats Logic
  const totalVolume = workouts.reduce((acc, w) => {
    return acc + w.exercises.reduce((eAcc, e) => eAcc + e.sets * e.reps * e.weight, 0);
  }, 0);

  const thisWeekCount = workouts.filter((w) => {
    const workoutDate = new Date(w.date);
    const now = new Date();
    const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));
    return workoutDate > oneWeekAgo;
  }).length;

  // Streak Logic (Checks consecutive days)
  const calculateStreak = () => {
    if (workouts.length === 0) return 0;
    
    // Convert to unique dates at midnight to ignore time differences
    const uniqueDates = [...new Set(workouts.map(w => new Date(w.date).setHours(0,0,0,0)))];
    uniqueDates.sort((a, b) => b - a); // Sort newest to oldest

    const today = new Date().setHours(0,0,0,0);
    const oneDay = 86400000; // milliseconds in a day

    // If the most recent workout isn't today or yesterday, streak is broken (0)
    if (uniqueDates[0] < today - oneDay) return 0;

    let streak = 1;
    for (let i = 0; i < uniqueDates.length - 1; i++) {
      if (uniqueDates[i] - uniqueDates[i+1] === oneDay) {
        streak++;
      } else {
        break; // Gap found, stop counting
      }
    }
    return streak;
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-body p-4 sm:p-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-primary rounded-xl shadow-glow">
            <Dumbbell className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-heading font-bold tracking-tight">FitTrack</h1>
            <p className="text-muted-foreground">Monitor your progress</p>
          </div>
        </header>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section>
          <StatsBar 
            totalWorkouts={workouts.length} 
            thisWeek={thisWeekCount} 
            totalVolume={totalVolume} 
            currentStreak={calculateStreak()} // Pass new prop
          />
        </section>

        <section>
          <AddWorkoutForm onAdd={handleAddWorkout} />
        </section>

        <section>
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading workouts...</div>
          ) : (
            <WorkoutHistory 
              workouts={workouts} 
              onDelete={handleDeleteWorkout} 
              onUpdate={handleUpdateWorkout} // Pass new prop
            />
          )}
        </section>
      </div>
    </div>
  );
}