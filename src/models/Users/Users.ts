import mongoose, { Schema, Document } from "mongoose";

export type UserRole = "Trainer" | "Member" | "Admin";

export interface IUser extends Document {
  user_id: string;
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  avatarUrl?: string;
  isOnboarded: boolean;
  trainerProfile?: {
    bio: string;
    experties: string[];
    certifications: {
      name: string;
      issuingOrganization: string;
      yearObtained?: number;
      certificationId?: string;
      isVerified?: boolean;
      url?: string;
    }[];
    yearsOfExperience?: number;
    priceRange?: number;
    location?: string[];
    availability?: string[];
    ratings?: number;
    setupStage?: number;
  };
  memberProfile?: {
    goals: string[];
    fitnessLevel: string;
    fitnessJourney: string;
    gender?: "Male" | "Female" | "Other";
    dob?: Date;
    healthCondition: string;
    preferredTrainingStyle?: string;
    setupStage?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    user_id: { type: String },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["Trainer", "Member", "Admin"],
      require: true,
    },

    avatarUrl: { type: String },
    isOnboarded: { type: Boolean, default: false },

    trainerProfile: {
      bio: { type: String },
      experties: [{ type: String }],

      certifications: [
        {
          name: { type: String, required: true },
          issuingOrganization: { type: String, required: true },
          yearObtained: { type: Number },
          certificationId: { type: String },
          isVerified: { type: Boolean, default: false },
          url: { type: String, default: "-" },
        },
      ],

      yearsOfExperience: { type: Number },
      priceRange: { type: Number },
      location: { type: String },
      availability: [{ type: String }],
      ratings: { type: Number, default: 1 },
      setupStage: { type: Number, default: 1 },
    },

    memberProfile: {
      goals: [{ type: String }],
      fitnessLevel: { type: String },
      fitnessJourney: { type: String },
      gender: { type: String, enum: ["Male", "Female", "Other"] },
      dob: { type: Date },
      healthCondition: { type: String },
      prefferedTrainingStyle: { type: String },
      setupStage: {
        type: Number,
        default: 1,
      },
    },
  },
  {
    timestamps: true,
  }
);

const User =
  mongoose.models.users || mongoose.model<IUser>("users", UserSchema);
export default User;
