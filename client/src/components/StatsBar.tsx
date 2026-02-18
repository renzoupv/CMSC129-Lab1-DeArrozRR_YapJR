import { motion } from "framer-motion";
import { Dumbbell, Flame, TrendingUp } from "lucide-react";

interface StatsBarProps {
  totalWorkouts: number;
  thisWeek: number;
  totalVolume: number;
}

const StatCard = ({
  icon: Icon,
  label,
  value,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="flex items-center gap-3 rounded-lg border border-border bg-card p-4"
  >
    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
      <Icon className="h-5 w-5 text-primary" />
    </div>
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-xl font-bold font-heading text-foreground">{value}</p>
    </div>
  </motion.div>
);

const StatsBar = ({ totalWorkouts, thisWeek, totalVolume }: StatsBarProps) => {
  const formatVolume = (v: number) => {
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `${(v / 1000).toFixed(1)}K`;
    return v.toString();
  };

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <StatCard icon={Dumbbell} label="Total Workouts" value={totalWorkouts.toString()} delay={0} />
      <StatCard icon={Flame} label="This Week" value={thisWeek.toString()} delay={0.1} />
      <StatCard icon={TrendingUp} label="Total Volume" value={`${formatVolume(totalVolume)} lbs`} delay={0.2} />
    </div>
  );
};

export default StatsBar;
