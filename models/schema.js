import mongoose from "mongoose";

const CatSchema = new mongoose.Schema({
  name: String,
  breed: String,
  age: Number,
  imageUrl: String,
  description: String,
  isAdopted: { type: Boolean, default: false }
});

export default mongoose.models.Cat || mongoose.model("Cat", CatSchema);