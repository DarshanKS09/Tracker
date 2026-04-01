import { Schema, model, models } from "mongoose";

const RoutineLogSchema = new Schema(
  {
    date: {
      type: String,
      required: true,
      index: true
    },
    taskName: {
      type: String,
      required: true,
      trim: true
    },
    completed: {
      type: Boolean,
      required: true,
      default: false
    },
    value: {
      type: Number,
      default: null
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now
    }
  },
  {
    versionKey: false
  }
);

RoutineLogSchema.index({ date: 1, taskName: 1 }, { unique: true });

export const RoutineLog = models.RoutineLog || model("RoutineLog", RoutineLogSchema);
