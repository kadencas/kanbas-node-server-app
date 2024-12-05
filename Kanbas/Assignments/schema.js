import mongoose from "mongoose";
const schema = new mongoose.Schema(
  { title: String,
    description: String,
    points: {type: Number, default: 0},
    dueDate: Date,
    availFrom: Date,
    availUntil: Date,
    course: { type: mongoose.Schema.Types.ObjectId, ref: "CourseModel" },
  }, {collection : "assignments", timestamps: true,});
export default schema;