const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// middleware
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// test route
app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Backend is running!" });
});

// --- Mongoose model (Workouts) ---
const workoutSchema = new mongoose.Schema(
  {
    title: { type: String, default: "Workout" }, // ADD: title field
    date: { type: String, required: true },
    duration: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },

    exercises: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        sets: { type: Number, required: true },
        reps: { type: Number, required: true },
        weight: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);
const Workout = mongoose.model("Workout", workoutSchema);

// --- CRUD routes ---
// READ
app.get("/api/workouts", async (req, res) => {
  // If the frontend asks for ?deleted=true, fetch the trash. Otherwise, fetch active.
  const isTrash = req.query.deleted === "true";
  const query = isTrash ? { isDeleted: true } : { isDeleted: { $ne: true } };

  const docs = await Workout.find(query).sort({ createdAt: -1 });
  const workouts = docs.map((d) => ({
    id: d._id.toString(),
    date: d.date,
    duration: d.duration ?? 0,
    title: d.title,
    exercises: d.exercises,
  }));
  res.json({ workouts });
});

// RESTORE (New Route!)
app.put("/api/workouts/:id/restore", async (req, res) => {
  await Workout.findByIdAndUpdate(req.params.id, { isDeleted: false });
  res.json({ ok: true, message: "Workout restored from trash." });
});

// DELETE (Handles BOTH Soft and Hard Delete)
app.delete("/api/workouts/:id", async (req, res) => {
  const { type } = req.query; 
  if (type === "hard") {
    await Workout.findByIdAndDelete(req.params.id);
    res.json({ ok: true, message: "Workout permanently purged." });
  } else {
    await Workout.findByIdAndUpdate(req.params.id, { isDeleted: true });
    res.json({ ok: true, message: "Workout moved to trash." });
  }
});

// CREATE
app.post("/api/workouts", async (req, res) => {
  const { date, title, exercises, duration } = req.body; // ADD: destructure title

  if (!date || !Array.isArray(exercises) || exercises.length === 0) {
    return res.status(400).send("Invalid payload");
  }

  const doc = await Workout.create({
    title: title?.trim() || "Workout", // ADD: save title with fallback
    date,
    exercises,
    duration: Number(duration) || 0,
  });

  res.status(201).json({
    workout: {
      id: doc._id.toString(),
      title: doc.title, // ADD: return title
      date: doc.date,
      duration: doc.duration ?? 0,
      exercises: doc.exercises,
    },
  });
});

// UPDATE
app.put("/api/workouts/:id", async (req, res) => {
  const { date, title, exercises, duration } = req.body; // ADD: destructure title

  if (!date || !Array.isArray(exercises)) {
    return res.status(400).send("Invalid payload");
  }

  const doc = await Workout.findByIdAndUpdate(
    req.params.id,
    {
      title: title?.trim() || "Workout", // ADD: update title with fallback
      date,
      exercises,
      duration: Number(duration) || 0,
    },
    { new: true }
  );

  if (!doc) return res.status(404).send("Workout not found");

  res.json({
    workout: {
      id: doc._id.toString(),
      title: doc.title, // ADD: return title
      date: doc.date,
      duration: doc.duration ?? 0,
      exercises: doc.exercises,
    },
  });
});

// DELETE
app.delete("/api/workouts/:id", async (req, res) => {
  const { type } = req.query; // Looks for ?type=hard in the URL

  if (type === "hard") {
    // HARD DELETE: Permanently purge from the database
    await Workout.findByIdAndDelete(req.params.id);
    res.json({ ok: true, message: "Workout permanently purged." });
  } else {
    // SOFT DELETE: Just flip the isDeleted flag
    await Workout.findByIdAndUpdate(req.params.id, { isDeleted: true });
    res.json({ ok: true, message: "Workout moved to trash." });
  }
});

// start server + connect DB
async function start() {
  if (!process.env.MONGO_URI) {
    throw new Error("Missing MONGO_URI in server/.env");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ MongoDB connected");

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`✅ API running on http://localhost:${PORT}`));
}

start().catch((err) => {
  console.error("❌ Server failed to start:", err);
  process.exit(1);
});