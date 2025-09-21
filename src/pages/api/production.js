import { dbConnect } from './db';
import mongoose from 'mongoose';

const ProductionSchema = new mongoose.Schema({
  name: String,
  media: [mongoose.Schema.Types.ObjectId],
  createdAt: { type: Date, default: Date.now },
  // Accept any audio_n fields
}, { strict: false });
const Production = mongoose.models.Production || mongoose.model('Production', ProductionSchema);

export default async function handler(req, res) {
  await dbConnect();
  if (req.method === 'POST') {
    const { name, media, ...audioFields } = req.body;
    if (!name || !media || !Array.isArray(media)) {
      return res.status(400).json({ success: false, message: 'Name and media are required' });
    }
    try {
      const entry = await Production.create({ name, media, ...audioFields });
      return res.json({ success: true, message: 'Production entry saved', id: entry._id });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  } else if (req.method === 'GET') {
    try {
      if (req.query && req.query.name) {
        const entry = await Production.findOne({ name: req.query.name });
        return res.json({ success: true, entry });
      }
      const allEntries = await Production.find({}).sort({ createdAt: -1 });
      return res.json({ success: true, entries: allEntries });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  } else if (req.method === 'PATCH') {
    const { id, ...audioFields } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID is required for PATCH' });
    }
    try {
      await Production.findByIdAndUpdate(id, { $set: audioFields });
      return res.json({ success: true, message: 'Audio updated' });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  } else {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}
