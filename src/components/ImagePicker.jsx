import React, { useRef, useState } from 'react';
import { uploadToCloudinary } from '../utils/cloudinaryUpload';
import { useRouter } from 'next/navigation';

const isImage = (file) => file.type.startsWith('image/');
const isVideo = (file) => file.type.startsWith('video/');

const ImagePicker = ({ onUploadSuccess }) => {
  const [media, setMedia] = useState([]);
  const dragItem = useRef();
  const dragOverItem = useRef();
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const router = useRouter();

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      type: file.type
    }));
    setMedia(prev => [...prev, ...previews]);
  };

  const handleDragStart = (index) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index) => {
    dragOverItem.current = index;
  };

  const handleDrop = () => {
    const items = [...media];
    const dragged = items.splice(dragItem.current, 1)[0];
    items.splice(dragOverItem.current, 0, dragged);
    setMedia(items);
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const removeMedia = (index) => {
    setMedia(media.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    setUploading(true);
    setUploadMsg('');
    try {
      const filesData = await Promise.all(media.map(async (item) => {
        if (isImage(item.file)) {
          const base64 = await toBase64(item.file);
          return {
            name: item.file.name,
            type: item.file.type,
            data: base64,
            videoUrl: '',
          };
        } else if (isVideo(item.file)) {
          const result = await uploadToCloudinary(item.file);
          return {
            name: item.file.name,
            type: item.file.type,
            data: '',
            videoUrl: result.secure_url || '',
          };
        }
        return null;
      }));
      const filtered = filesData.filter(Boolean);
      const res = await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ media: filtered }),
      });
      const data = await res.json();
      if (data.success) {
        setUploadMsg('Upload successful!');
        setMedia([]);
        if (onUploadSuccess) onUploadSuccess();
      } else {
        setUploadMsg(data.message || 'Upload failed');
      }
    } catch (err) {
      setUploadMsg('Server error');
    }
    setUploading(false);
  };

  const toBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <div
      style={{
        margin: '2rem auto',
        maxWidth: 600,
        borderRadius: 16,
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        padding: 32,
      }}
    >
      <label
        htmlFor="media-upload"
        style={{
          display: 'inline-block',
          padding: '12px 28px',
          background: 'linear-gradient(90deg, #4f8cff 0%, #6ed6ff 100%)',
          color: '#fff',
          borderRadius: 8,
          fontWeight: 600,
          cursor: 'pointer',
          marginBottom: 24,
          fontSize: 16,
          boxShadow: '0 2px 8px rgba(79,140,255,0.08)',
        }}
      >
        + Add Images/Videos
      </label>
      <input
        id="media-upload"
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={handleFiles}
        style={{ display: 'none' }}
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          marginTop: 24,
        }}
      >
        {media.map((item, idx) => (
          <div
            key={idx}
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragEnter={() => handleDragEnter(idx)}
            onDragEnd={handleDrop}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              border: '1px solid #e3e8ee',
              borderRadius: 12,
              padding: 12,
              background: '#f7fafd',
              cursor: 'move',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              transition: 'box-shadow 0.2s',
            }}
          >
            {isImage(item.file) ? (
              <img
                src={item.url}
                alt="preview"
                style={{
                  width: 72,
                  height: 72,
                  objectFit: 'cover',
                  borderRadius: 8,
                  border: '1px solid #e3e8ee',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                }}
              />
            ) : isVideo(item.file) ? (
              <video
                src={item.url}
                controls
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 8,
                  border: '1px solid #e3e8ee',
                  background: '#222',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                }}
              />
            ) : null}
            <span
              style={{
                flex: 1,
                fontWeight: 500,
                color: '#222',
                fontSize: 15,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={item.file.name}
            >
              {item.file.name}
            </span>
            <button
              onClick={() => removeMedia(idx)}
              style={{
                color: '#fff',
                background: 'linear-gradient(90deg, #ff5858 0%, #ffae70 100%)',
                border: 'none',
                borderRadius: 6,
                padding: '8px 16px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: 14,
                boxShadow: '0 1px 4px rgba(255,88,88,0.08)',
                transition: 'background 0.2s',
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      {media.length > 0 && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          style={{
            marginTop: 24,
            padding: '0.7rem 2.5rem',
            background: '#0070f3',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: '1.1rem',
            cursor: uploading ? 'not-allowed' : 'pointer',
          }}
        >
          {uploading ? 'Uploading...' : 'Upload All'}
        </button>
      )}
      {uploadMsg && (
        <div
          style={{
            marginTop: 16,
            color: uploadMsg.includes('successful') ? '#22bb33' : '#e74c3c',
          }}
        >
          {uploadMsg}
        </div>
      )}
      <button
        style={{
          marginTop: 32,
          padding: '12px 28px',
          background: 'linear-gradient(90deg, #10b981 0%, #3b82f6 100%)',
          color: '#fff',
          borderRadius: 8,
          fontWeight: 600,
          fontSize: 16,
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(16,185,129,0.08)',
          border: 'none',
        }}
        onClick={() => router.push('/playground')}
      >
        Test It in Playground
      </button>
    </div>
  );
};

export default ImagePicker;
