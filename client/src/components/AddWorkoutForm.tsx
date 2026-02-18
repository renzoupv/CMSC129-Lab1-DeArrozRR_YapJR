import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Check } from "lucide-react";
import { Exercise, Workout } from "@/types/workout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AddWorkoutFormProps {
  onAdd: (workout: Workout) => void;
}

const AddWorkoutForm = ({ onAdd }: AddWorkoutFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [name, setName] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");

  const addExercise = () => {
    if (!name || !sets || !reps) return;
    setExercises((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name,
        sets: Number(sets),
        reps: Number(reps),
        weight: Number(weight) || 0,
      },
    ]);
    setName("");
    setSets("");
    setReps("");
    setWeight("");
  };

  const removeExercise = (id: string) => {
    setExercises((prev) => prev.filter((e) => e.id !== id));
  };

  const saveWorkout = () => {
    if (exercises.length === 0) return;
    onAdd({
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      exercises,
      duration: 0,
    });
    setExercises([]);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Button
          onClick={() => setIsOpen(true)}
          className="w-full gap-2 bg-primary text-primary-foreground font-heading font-semibold text-base h-12 hover:brightness-110 animate-pulse-glow"
        >
          <Plus className="h-5 w-5" />
          Start New Workout
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-lg border border-border bg-card p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-heading font-bold text-foreground">New Workout</h3>
        <button onClick={() => { setIsOpen(false); setExercises([]); }} className="text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Exercise list */}
      <AnimatePresence>
        {exercises.map((ex) => (
          <motion.div
            key={ex.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex items-center justify-between rounded-md bg-secondary p-3"
          >
            <div>
              <p className="font-medium text-foreground">{ex.name}</p>
              <p className="text-sm text-muted-foreground">
                {ex.sets}×{ex.reps} {ex.weight > 0 && `@ ${ex.weight} lbs`}
              </p>
            </div>
            <button onClick={() => removeExercise(ex.id)} className="text-muted-foreground hover:text-destructive">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Add exercise inputs */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Input
          placeholder="Exercise"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="col-span-2 sm:col-span-1 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
        />
        <Input
          placeholder="Sets"
          type="number"
          value={sets}
          onChange={(e) => setSets(e.target.value)}
          className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
        />
        <Input
          placeholder="Reps"
          type="number"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
        />
        <Input
          placeholder="Weight (lbs)"
          type="number"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="hidden sm:block bg-secondary border-border text-foreground placeholder:text-muted-foreground"
        />
      </div>
      <div className="flex sm:hidden">
        <Input
          placeholder="Weight (lbs)"
          type="number"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={addExercise}
          disabled={!name || !sets || !reps}
          className="flex-1 gap-1 border-border text-foreground hover:bg-secondary"
        >
          <Plus className="h-4 w-4" /> Add Exercise
        </Button>
        <Button
          onClick={saveWorkout}
          disabled={exercises.length === 0}
          className="flex-1 gap-1 bg-primary text-primary-foreground hover:brightness-110"
        >
          <Check className="h-4 w-4" /> Save Workout
        </Button>
      </div>
    </motion.div>
  );
};

export default AddWorkoutForm;

