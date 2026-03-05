import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Clock, Edit2, Plus, X, Check } from "lucide-react";
import type { Workout, Exercise } from "@/types/workout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface WorkoutHistoryProps {
  workouts: Workout[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, updated: Workout) => void;
}

const WorkoutHistory = ({ workouts, onDelete, onUpdate }: WorkoutHistoryProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Edit mode states
  const [editExercises, setEditExercises] = useState<Exercise[]>([]);
  const [name, setName] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");

  if (workouts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
        <p className="text-muted-foreground font-heading text-lg">No workouts yet</p>
        <p className="text-sm text-muted-foreground mt-1">Start your first workout above!</p>
      </div>
    );
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    if (diff < 7) return `${diff} days ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const startEdit = (workout: Workout) => {
    setEditingId(workout.id);
    setEditExercises([...workout.exercises]);
    setName(""); setSets(""); setReps(""); setWeight("");
  };

  const addExercise = () => {
    if (!name || !sets || !reps) return;
    setEditExercises([...editExercises, {
      id: crypto.randomUUID(),
      name,
      sets: Number(sets),
      reps: Number(reps),
      weight: Number(weight) || 0,
    }]);
    setName(""); setSets(""); setReps(""); setWeight("");
  };

  const removeExercise = (id: string) => {
    setEditExercises(editExercises.filter((e) => e.id !== id));
  };

  const saveEdit = (workout: Workout) => {
    if (editExercises.length === 0) return;
    onUpdate(workout.id, { ...workout, exercises: editExercises });
    setEditingId(null);
  };

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-heading font-bold text-foreground">History</h2>
      {workouts.map((workout, i) => {
        const isEditing = editingId === workout.id;
        const totalVolume = workout.exercises.reduce((acc, e) => acc + e.sets * e.reps * e.weight, 0);

        if (isEditing) {
          return (
            <motion.div key={workout.id} className="rounded-lg border border-primary/50 bg-card p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-heading font-bold text-sm text-primary">Editing Workout</span>
                <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2">
                <AnimatePresence>
                  {editExercises.map((ex) => (
                    <motion.div key={ex.id} exit={{ opacity: 0 }} className="flex justify-between items-center rounded bg-secondary p-2 text-sm">
                      <span>{ex.name} ({ex.sets}×{ex.reps} {ex.weight > 0 && `@ ${ex.weight}lbs`})</span>
                      <button onClick={() => removeExercise(ex.id)} className="text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Input placeholder="Exercise" value={name} onChange={(e) => setName(e.target.value)} className="col-span-2 sm:col-span-1 h-8 text-sm" />
                <Input placeholder="Sets" type="number" value={sets} onChange={(e) => setSets(e.target.value)} className="h-8 text-sm" />
                <Input placeholder="Reps" type="number" value={reps} onChange={(e) => setReps(e.target.value)} className="h-8 text-sm" />
                <Input placeholder="Weight" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="h-8 text-sm hidden sm:block" />
              </div>
              <Input placeholder="Weight" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="h-8 text-sm sm:hidden" />

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={addExercise} disabled={!name || !sets || !reps} className="flex-1 text-xs">
                  <Plus className="h-3 w-3 mr-1" /> Add Exercise
                </Button>
                <Button size="sm" onClick={() => saveEdit(workout)} disabled={editExercises.length === 0} className="flex-1 text-xs bg-primary text-primary-foreground">
                  <Check className="h-3 w-3 mr-1" /> Save Changes
                </Button>
              </div>
            </motion.div>
          );
        }

        return (
          <motion.div
            key={workout.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group rounded-lg border border-border bg-card p-4 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{formatDate(workout.date)}</span>
                  {totalVolume > 0 && (
                    <span className="text-xs rounded-full bg-primary/10 px-2 py-0.5 text-primary font-medium">
                      {totalVolume.toLocaleString()} lbs
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {workout.exercises.map((ex) => (
                    <span key={ex.id} className="inline-flex items-center rounded-md bg-secondary px-2.5 py-1 text-sm text-secondary-foreground">
                      {ex.name} <span className="ml-1 text-muted-foreground">{ex.sets}×{ex.reps}</span>
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(workout)} className="text-muted-foreground hover:text-primary transition-colors">
                  <Edit2 className="h-4 w-4" />
                </button>
                <button onClick={() => onDelete(workout.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default WorkoutHistory;