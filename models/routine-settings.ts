import { Schema, model, models } from "mongoose";

const RoutineTaskSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ["boolean", "duration", "water"],
      required: true
    },
    unit: {
      type: String,
      default: ""
    },
    helperText: {
      type: String,
      default: ""
    }
  },
  { _id: false }
);

const RoutineSettingsSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "default"
    },
    profile: {
      displayName: {
        type: String,
        default: "Routine owner"
      },
      avatarUrl: {
        type: String,
        default: ""
      }
    },
    routines: {
      type: [RoutineTaskSchema],
      default: []
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
);

export const RoutineSettingsModel =
  models.RoutineSettings || model("RoutineSettings", RoutineSettingsSchema);
