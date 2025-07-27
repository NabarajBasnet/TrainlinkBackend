import { Schema, model, Types } from "mongoose";

const ProgramSchema = new Schema(
  {
    trainerId: { type: Types.ObjectId, ref: "users", required: true },

    title: { type: String, required: true },
    description: { type: String, required: true },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: true,
    },
    durationInWeeks: { type: Number, required: true },
    price: { type: Number, required: true },
    maxSlot: { type: Number, required: true },
    availableSlots: {
      type: Number,
      default: function () {
        return this.maxSlot;
      },
    },
    category: { type: String, required: true },

    // Status and visibility
    status: {
      type: String,
      enum: ["Active", "Inactive", "Draft", "Completed"],
      default: "Active",
    },

    // Ratings and reviews
    rating: { type: Number, default: 0 },

    // Engagement
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },

    // Location and availability
    location: { type: String },
    isOnline: { type: Boolean, default: true },
    isInPerson: { type: Boolean, default: false },

    // Tags for search
    tags: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

// Index for better search performance
ProgramSchema.index({ title: "text", description: "text", tags: "text" });
ProgramSchema.index({ trainerId: 1, status: 1 });
ProgramSchema.index({ category: 1, level: 1, price: 1 });

export const Program = model("Program", ProgramSchema);
