import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Clock, Edit2, Plus, X, Check, Pencil, Archive, Undo2 } from "lucide-react";
import type { Workout, Exercise } from "@/types/workout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface WorkoutHistoryProps {
  workouts: Workout[];
  onDelete: (id: string, type: "soft" | "hard") => void;
  onUpdate: (id: string, updated: Workout) => void;
  onRestore: (id: string) => void;
  isTrashView: boolean;
}

// Inline editable row for a single exercise
const ExerciseRow = ({
  exercise,
  onUpdate,
  onRemove,
}: {
  exercise: Exercise;
  onUpdate: (updated: Exercise) => void;
  onRemove: () => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(exercise.name);
  const [sets, setSets] = useState(String(exercise.sets));
  const [reps, setReps] = useState(String(exercise.reps));
  const [weight, setWeight] = useState(String(exercise.weight));

  const save = () => {
    if (!name.trim() || !sets || !reps) return;
    onUpdate({
      ...exercise,
      name: name.trim(),
      sets: Number(sets),
      reps: Number(reps),
      weight: weight !== "" ? Math.max(0, Number(weight)) : 0,
    });
    setIsEditing(false);
  };

  const cancel = () => {
    setName(exercise.name);
    setSets(String(exercise.sets));
    setReps(String(exercise.reps));
    setWeight(String(exercise.weight));
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") save();
    if (e.key === "Escape") cancel();
  };

  if (isEditing) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-[1fr_auto] gap-2 rounded bg-primary/5 border border-primary/20 p-2"
      >
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Exercise"
            className="col-span-2 sm:col-span-1 h-7 text-xs"
          />
          <Input
            value={sets}
            onChange={(e) => setSets(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Sets"
            type="number"
            min={1}
            className="h-7 text-xs"
          />
          <Input
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Reps"
            type="number"
            min={1}
            className="h-7 text-xs"
          />
          <Input
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Weight (lbs)"
            type="number"
            min={0}
            className="h-7 text-xs"
          />
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={save}
            disabled={!name.trim() || !sets || !reps}
            className="text-primary hover:text-primary/70 disabled:opacity-30 transition-colors"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            onClick={cancel}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="group/row flex justify-between items-center rounded bg-secondary p-2 text-sm"
    >
      <span>
        {exercise.name}{" "}
        <span className="text-muted-foreground">
          ({exercise.sets}×{exercise.reps}
          {exercise.weight > 0 && ` @ ${exercise.weight}lbs`})
        </span>
      </span>
      <div className="flex items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
        <button
          onClick={() => setIsEditing(true)}
          className="text-muted-foreground hover:text-primary transition-colors"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onRemove}
          className="text-muted-foreground hover:text-destructive transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────

const WorkoutHistory = ({ workouts, onDelete, onUpdate, onRestore, isTrashView }: WorkoutHistoryProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editExercises, setEditExercises] = useState<Exercise[]>([]);
  const [editTitle, setEditTitle] = useState("");

  const [name, setName] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [addError, setAddError] = useState(false);

  if (workouts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
        <p className="text-muted-foreground font-heading text-lg">
          {isTrashView ? "Trash is empty" : "No workouts yet"}
        </p>
        {!isTrashView && (
          <p className="text-sm text-muted-foreground mt-1">Start your first workout above!</p>
        )}
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
    setEditTitle(workout.title ?? "Workout");
    setName(""); setSets(""); setReps(""); setWeight("");
    setAddError(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setName(""); setSets(""); setReps(""); setWeight("");
    setAddError(false);
  };

  const updateExercise = (id: string, updated: Exercise) => {
    setEditExercises((prev) => prev.map((e) => (e.id === id ? updated : e)));
  };

  const removeExercise = (id: string) => {
    setEditExercises((prev) => prev.filter((e) => e.id !== id));
  };

  const addExercise = () => {
    if (!name.trim() || !sets || !reps) {
      setAddError(true);
      return;
    }
    setAddError(false);
    setEditExercises((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: name.trim(),
        sets: Number(sets),
        reps: Number(reps),
        weight: weight !== "" ? Math.max(0, Number(weight)) : 0,
      },
    ]);
    setName(""); setSets(""); setReps(""); setWeight("");
  };

  const handleAddKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") addExercise();
  };

  const saveEdit = (workout: Workout) => {
    if (editExercises.length === 0) return;
    onUpdate(workout.id, { ...workout, title: editTitle.trim() || "Workout", exercises: editExercises });
    cancelEdit();
  };

  return (
    <div className="space-y-3">
      {workouts.map((workout, i) => {
        const isEditing = editingId === workout.id;
        const totalVolume = workout.exercises.reduce(
          (acc, e) => acc + e.sets * e.reps * e.weight,
          0
        );

        if (isEditing) {
          return (
            <motion.div key={workout.id} className="rounded-lg border border-primary/50 bg-card p-4 space-y-4">
              <div className="flex items-center gap-3">
                <Input
                  autoFocus
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Workout name"
                  className="flex-1 text-base font-heading font-bold bg-transparent border-0 border-b border-primary/40 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary placeholder:text-muted-foreground/50 text-primary"
                />
                <button onClick={cancelEdit} className="text-muted-foreground hover:text-foreground shrink-0">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2">
                {editExercises.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    No exercises — add one below.
                  </p>
                )}
                <AnimatePresence>
                  {editExercises.map((ex) => (
                    <ExerciseRow
                      key={ex.id}
                      exercise={ex}
                      onUpdate={(updated) => updateExercise(ex.id, updated)}
                      onRemove={() => removeExercise(ex.id)}
                    />
                  ))}
                </AnimatePresence>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 pt-1 border-t border-border">
                <Input
                  placeholder="New exercise"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setAddError(false); }}
                  onKeyDown={handleAddKeyDown}
                  className={`col-span-2 sm:col-span-1 h-8 text-sm ${addError && !name.trim() ? "border-destructive" : ""}`}
                />
                <Input
                  placeholder="Sets"
                  type="number"
                  min={1}
                  value={sets}
                  onChange={(e) => { setSets(e.target.value); setAddError(false); }}
                  onKeyDown={handleAddKeyDown}
                  className={`h-8 text-sm ${addError && !sets ? "border-destructive" : ""}`}
                />
                <Input
                  placeholder="Reps"
                  type="number"
                  min={1}
                  value={reps}
                  onChange={(e) => { setReps(e.target.value); setAddError(false); }}
                  onKeyDown={handleAddKeyDown}
                  className={`h-8 text-sm ${addError && !reps ? "border-destructive" : ""}`}
                />
                <Input
                  placeholder="Weight (lbs)"
                  type="number"
                  min={0}
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  onKeyDown={handleAddKeyDown}
                  className="h-8 text-sm"
                />
              </div>
              {addError && (
                <p className="text-xs text-destructive -mt-2">
                  Exercise name, sets, and reps are required.
                </p>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={addExercise} className="flex-1 text-xs">
                  <Plus className="h-3 w-3 mr-1" /> Add Exercise
                </Button>
                <Button
                  size="sm"
                  onClick={() => saveEdit(workout)}
                  disabled={editExercises.length === 0}
                  className="flex-1 text-xs bg-primary text-primary-foreground"
                >
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
                <p className="font-heading font-bold text-foreground">{workout.title}</p>
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
              
              {/* ✅ THE BUTTON CONTAINER */}
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {isTrashView ? (
                  <>
                    {/* RESTORE BUTTON (Only in Trash) */}
                    <button onClick={() => onRestore(workout.id)} title="Restore Workout" className="text-muted-foreground hover:text-green-500 transition-colors">
                      <Undo2 className="h-4 w-4" />
                    </button>
                    {/* HARD DELETE BUTTON (Only in Trash) */}
                    <button onClick={() => onDelete(workout.id, "hard")} title="Permanently Delete" className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <>
                    {/* EDIT BUTTON (Only in Active) */}
                    <button onClick={() => startEdit(workout)} title="Edit Workout" className="text-muted-foreground hover:text-primary transition-colors">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    {/* SOFT DELETE BUTTON (Only in Active) */}
                    <button onClick={() => onDelete(workout.id, "soft")} title="Move to Trash" className="text-muted-foreground hover:text-orange-500 transition-colors">
                      <Archive className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default WorkoutHistory;