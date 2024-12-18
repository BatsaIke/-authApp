import mongoose, { Schema, Document } from 'mongoose';

// Extend the IUser interface

export interface IUser extends Document {
  _id: string;
    fullName: string;
  email: string;
  phone: string;
  password: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}

const UserSchema: Schema = new Schema( 
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: false, match: /^[0-9]{10}$/ },
    password: { type: String, required: true },
    refreshToken: { type: String },
    resetPasswordToken: { type: String }, // Add to schema
    resetPasswordExpires: { type: Date }, // Add to schema
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
