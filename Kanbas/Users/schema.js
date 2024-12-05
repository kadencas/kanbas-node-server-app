import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: String,
  email: String,
  lastName: String,
  dob: Date,
  role: {
    type: String,
    enum: ["STUDENT", "FACULTY", "ADMIN", "USER"],
    default: "USER",
  },
  loginId: {
    type: String,
    default: () => Math.random().toString(36).substring(2, 11), 
    unique: true, 
  },
  section: { type: String, default: "S101" },
  lastActivity: { type: Date, default: () => new Date() },
  totalActivity: { type: String, default: "00:00:00" },
},
  { collection: "users" }
);
export default userSchema;