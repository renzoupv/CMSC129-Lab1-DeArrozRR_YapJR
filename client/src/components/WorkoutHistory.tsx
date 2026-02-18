import { motion } from "framer-motion";
import { Trash2, Clock } from "lucide-react";
import { Workout } from "@/types/workout";

interface WorkoutHistoryProps {
  workouts: Workout[];
  onDelete: (id: string) => void;
}

const WorkoutHistory = ({ workouts, onDelete }: WorkoutHistoryProps) => {
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

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-heading font-bold text-foreground">History</h2>
      {workouts.map((workout, i) => {
        const totalVolume = workout.exercises.reduce(
          (acc, e) => acc + e.sets * e.reps * e.weight,
          0
        );
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
                    <span
                      key={ex.id}
                      className="inline-flex items-center rounded-md bg-secondary px-2.5 py-1 text-sm text-secondary-foreground"
                    >
                      {ex.name}{" "}
                      <span className="ml-1 text-muted-foreground">
                        {ex.sets}×{ex.reps}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => onDelete(workout.id)}
                className="ml-2 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default WorkoutHistory;
