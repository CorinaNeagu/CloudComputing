import mongoose from "mongoose";

const RequestSchema = new mongoose.Schema({
  catId: { type: String, required: true },
  catName: String,
  ownerEmail: String,
  adopterEmail: String,
  adopterName: String,
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected'], 
    default: 'pending' 
  }
}, { timestamps: true }); // Adaugă automat data creării

export default mongoose.models.Request || mongoose.model("Request", RequestSchema);