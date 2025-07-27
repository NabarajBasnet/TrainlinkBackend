import mongoose, { Schema, Document } from "mongoose";

export type UserRole = "Trainer" | "Member" | "Admin";

export interface IUser extends Document {
  user_id: string;
  fullName: string;
  contactNo?: string;
  email: string;
  socialMedia: string[];
  password: string;
  role: UserRole;
  avatarUrl?: string;
  location?: string;
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
    clients?: number;
    completedPrograms?: number;
    location?: string[];
    availability?: string[];
    ratings?: number;
    setupStage?: number;
    isVerified?: boolean;
    verificationStatus?: 'pending' | 'approved' | 'rejected';
    verificationApplication?: {
      submittedAt: Date;
      reviewedAt?: Date;
      reviewedBy?: string;
      rejectionReason?: string;
      documents: {
        governmentId: string;
        businessLicense?: string;
      };
      fullName?: string;
      email?: string;
      phoneNumber?: string;
      businessName?: string;
      businessType?: string;
      website?: string;
      socialMediaHandles?: string;
      reasonForVerification?: string;
      additionalInfo?: string;
    };
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
    completedPlans?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    user_id: { type: String },
    fullName: { type: String, required: true },
    contactNo: { type: String, required: false },
    email: { type: String, required: true },
    socialMedia: [
      {
        platform: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["Trainer", "Member", "Admin"],
      require: true,
    },

    avatarUrl: { type: String },
    location: { type: String },
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
      clients: { type: Number },
      completedPrograms: { type: Number, default: 0 },
      location: { type: String },
      availability: [{ type: String }],
      ratings: { type: Number, default: 1 },
      setupStage: { type: Number, default: 1 },
      isVerified: { type: Boolean, default: false },
      verificationStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
      },
      verificationApplication: {
        submittedAt: { type: Date, required: true },
        reviewedAt: { type: Date },
        reviewedBy: { type: String },
        rejectionReason: { type: String },
        documents: {
          governmentId: { type: String, required: true },
          businessLicense: { type: String },
        },
      },
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
      completedPlans: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

const User =
  mongoose.models.users || mongoose.model<IUser>("users", UserSchema);
export default User;
