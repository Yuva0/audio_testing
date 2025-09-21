import { dbConnect } from './db';
import mongoose from 'mongoose';

const MediaSchema = new mongoose.Schema({
  name: String,
  type: String,
  data: String, // base64 for images, empty for videos
  videoUrl: String,  // Cloudinary URL for videos, empty for images
  uploadedAt: { type: Date, default: Date.now },
  order: { type: Number, default: 0 },
});
const Media = mongoose.models.Media || mongoose.model('Media', MediaSchema);

export default async function handler(req, res) {
  await dbConnect();
  if (req.method === 'POST') {
    const { media } = req.body;
    if (!media || !Array.isArray(media) || media.length === 0) {
      return res.status(400).json({ success: false, message: 'No media provided' });
    }
    try {
      await Media.insertMany(media.map(item => ({
        name: item.name,
        type: item.type,
        data: item.data || '',
        videoUrl: item.videoUrl || '',
      })));
      return res.json({ success: true, message: 'Media uploaded successfully' });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  } else if (req.method === 'GET') {
    try {
      const allMedia = await Media.find({}).sort({ order: 1, uploadedAt: -1 });
      return res.json({ success: true, media: allMedia });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  } else if (req.method === 'DELETE') {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, message: 'No id provided' });
    }
    try {
      await Media.findByIdAndDelete(id);
      return res.json({ success: true, message: 'Media deleted' });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  } else {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb', // You can adjust this as needed for images
    },
  },
};
