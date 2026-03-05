import { useState, useCallback } from "react";
import type { Workout, Exercise } from "@/types/workout";

const STORAGE_KEY = "workout-tracker-data";

const loadWorkouts = (): Workout[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveWorkouts = (workouts: Workout[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
};

export const useWorkouts = () => {
  const [workouts, setWorkouts] = useState<Workout[]>(loadWorkouts);

  const addWorkout = useCallback((workout: Workout) => {
    setWorkouts((prev) => {
      const updated = [workout, ...prev];
      saveWorkouts(updated);
      return updated;
    });
  }, []);

  const deleteWorkout = useCallback((id: string) => {
    setWorkouts((prev) => {
      const updated = prev.filter((w) => w.id !== id);
      saveWorkouts(updated);
      return updated;
    });
  }, []);

  const totalWorkouts = workouts.length;
  const totalVolume = workouts.reduce(
    (acc, w) => acc + w.exercises.reduce((a, e) => a + e.sets * e.reps * e.weight, 0),
    0
  );
  const thisWeek = workouts.filter((w) => {
    const d = new Date(w.date);
    const now = new Date();
    const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  }).length;

  return { workouts, addWorkout, deleteWorkout, totalWorkouts, totalVolume, thisWeek };
};
