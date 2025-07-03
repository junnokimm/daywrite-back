import mongoose from 'mongoose';

const writingSchema = new mongoose.Schema({
  title: String,
  content: String,
  keywords: [String],
  genres: [String],
});

export default mongoose.model('Writing', writingSchema);
