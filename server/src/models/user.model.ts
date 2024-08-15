import { Schema, model, Document, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId; 
  email: string;
  password: string;
  name: string;
  lastLogin: Date;
  isVerified: boolean;
  resetPasswordToken: string | undefined;
  resetPasswordExpiresAt: Date | undefined;
  verificationToken: string | undefined;
  verificationTokenExpiresAt: Date | undefined;
}

const UserSchema: Schema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
  },
  {
    timestamps: true,
  },
);

const User = model<IUser>('User', UserSchema);

export default User;