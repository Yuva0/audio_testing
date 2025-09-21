import { dbConnect } from '../db';
import mongoose from 'mongoose';

const MediaSchema = new mongoose.Schema({
  name: String,
  type: String,
  data: String,
  uploadedAt: { type: Date, default: Date.now },
  order: { type: Number, default: 0 },
});
const Media = mongoose.models.Media || mongoose.model('Media', MediaSchema);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  await dbConnect();
  const { order } = req.body; // array of _id in new order
  if (!order || !Array.isArray(order)) {
    return res.status(400).json({ success: false, message: 'Invalid order array' });
  }
  try {
    // Update each media's order field
    await Promise.all(order.map((id, idx) =>
      Media.findByIdAndUpdate(id, { order: idx })
    ));
    return res.json({ success: true, message: 'Order updated' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
