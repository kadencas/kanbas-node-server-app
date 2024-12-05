import mongoose from "mongoose";
import schema from "./schema.js";
const model = mongoose.model("MongooseModel", schema)
export default model;