import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ImagePicker from '../components/ImagePicker';

const Dashboard = () => {
  const router = useRouter();
  const [mediaList, setMediaList] = useState([]);
  const [orderChanged, setOrderChanged] = useState(false);
  const [playgroundEntries, setPlaygroundEntries] = useState([]);
  const [productionEntries, setProductionEntries] = useState([]);
  const dragItem = useRef();
  const dragOverItem = useRef();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      if (isLoggedIn !== 'true') {
        router.push('/admin');
      }
    }
  }, [router]);

  useEffect(() => {
    // Fetch all media from the API
    const fetchMedia = async () => {
      try {
        const res = await fetch('/api/media');
        const data = await res.json();
        if (data.success) {
          setMediaList(data.media);
        }
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchMedia();
  }, []);

  // Add a function to refresh media list
  const refreshMediaList = async () => {
    try {
      const res = await fetch('/api/media');
      const data = await res.json();
      if (data.success) {
        setMediaList(data.media);
      }
    } catch (err) {
      // Optionally handle error
    }
  };

  useEffect(() => {
    refreshMediaList();
    // Fetch playground entries
    const fetchPlayground = async () => {
      try {
        const res = await fetch('/api/playground');
        const data = await res.json();
        if (data.success) {
          setPlaygroundEntries(data.entries);
        }
      } catch (err) {}
    };
    fetchPlayground();
  }, []);

  // Fetch production entries
  useEffect(() => {
    const fetchProduction = async () => {
      const res = await fetch('/api/production');
      const data = await res.json();
      if (data.success && data.entries) setProductionEntries(data.entries);
    };
    fetchProduction();
  }, []);

  const handleDragStart = (index) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index) => {
    dragOverItem.current = index;
  };

  const handleDrop = () => {
    const items = [...mediaList];
    const dragged = items.splice(dragItem.current, 1)[0];
    items.splice(dragOverItem.current, 0, dragged);
    setMediaList(items);
    setOrderChanged(true);
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const handleSaveOrder = async () => {
    try {
      const res = await fetch('/api/media/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: mediaList.map(item => item._id) }),
      });
      const data = await res.json();
      if (data.success) {
        setOrderChanged(false);
      } else {
        alert(data.message || 'Failed to save order');
      }
    } catch (err) {
      alert('Server error');
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this media?');
    if (!confirmDelete) return;
    try {
      const res = await fetch('/api/media', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        setMediaList(mediaList.filter(item => item._id !== id));
      } else {
        alert(data.message || 'Failed to delete');
      }
    } catch (err) {
      alert('Server error');
    }
  };

  // Add a function to delete a playground entry
  const handleDeletePlayground = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this Playground entry?');
    if (!confirmDelete) return;
    try {
      const res = await fetch('/api/playground', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        setPlaygroundEntries(playgroundEntries.filter(item => item._id !== id));
      } else {
        alert(data.message || 'Failed to delete');
      }
    } catch (err) {
      alert('Server error');
    }
  };

  // Add a function to delete a production entry
  const handleDeleteProduction = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this Production entry?');
    if (!confirmDelete) return;
    try {
      const res = await fetch('/api/production', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        setProductionEntries(productionEntries.filter(item => item._id !== id));
      } else {
        alert(data.message || 'Failed to delete');
      }
    } catch (err) {
      alert('Server error');
    }
  };

  return (
	<div style={{ textAlign: 'center', marginTop: '3rem' }}>
		<h1>Welcome to the Dashboard!</h1>
		<div style={{ margin: '2rem auto' }}>
			<div
				style={{
					display: 'flex',
					flexWrap: 'wrap',
					gap: 32, // Increased gap for more height between items
					justifyContent: 'center',
				}}
			>
				{mediaList.map((item, idx) => (
					<div
						key={item._id}
						draggable
						onDragStart={() => handleDragStart(idx)}
						onDragEnter={() => handleDragEnter(idx)}
						onDragEnd={handleDrop}
						style={{
							position: 'relative',
							display: 'flex',
							alignItems: 'center',
							gap: 16,
							padding: 8,
							border: 'none',
							cursor: 'move',
							marginBottom: 32, // Extra vertical space between rows
						}}
					>
						<button
							onClick={() => handleDelete(item._id)}
							style={{
								position: 'absolute',
								top: 4,
								right: 4,
								background: 'rgba(255,255,255,0.8)',
								border: 'none',
								borderRadius: '50%',
								width: 28,
								height: 28,
								fontSize: 18,
								color: '#e74c3c',
								cursor: 'pointer',
								zIndex: 2,
							}}
							title="Delete"
						>
							×
						</button>
						{item.type.startsWith('image/') && item.data ? (
							<img
								src={item.data}
								alt=""
								style={{
									width: 320, // Increased width
									height: 320, // Increased height
									objectFit: 'cover',
									borderRadius: 6,
									display: 'block',
								}}
							/>
						) : item.type.startsWith('video/') ? (
							<video
								src={item.videoUrl || item.data}
								controls
								style={{
									width: 320, // Increased width
									height: 320, // Increased height
									borderRadius: 6,
									display: 'block',
								}}
							/>
						) : null}
					</div>
				))}
			</div>
			{orderChanged && (
				<button
					onClick={handleSaveOrder}
					style={{ marginTop: 24, padding: '0.7rem 2.5rem', background: '#0070f3', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '1.1rem', cursor: 'pointer' }}
				>
					Save Order
				</button>
			)}
		</div>
		<ImagePicker onUploadSuccess={refreshMediaList} />
		{/* Playground Table */}
		{playgroundEntries.length > 0 && (
			<div style={{ margin: '3rem auto', maxWidth: 1200 }}>
				<h2 style={{ marginBottom: 16, color: '#fff' }}>Playground Submissions</h2>
				<div style={{ overflowX: 'auto' }}>
					<table style={{ borderCollapse: 'collapse', width: '100%', background: '#18181b', borderRadius: 8, color: '#fff' }}>
						<thead>
							<tr>
								{Object.keys(playgroundEntries[0]).filter(k => k !== '_id' && k !== '__v' && k !== 'media').map((key) => (
									<th key={key} style={{ padding: 8, borderBottom: '1px solid #333', background: '#27272a', fontWeight: 600, color: '#a3e635' }}>{key}</th>
								))}
							</tr>
						</thead>
						<tbody>
							{playgroundEntries.map((entry, idx) => (
								<tr key={entry._id || idx} style={{ background: idx % 2 === 0 ? '#18181b' : '#232326' }}>
									{Object.keys(playgroundEntries[0]).filter(k => k !== '_id' && k !== '__v' && k !== 'media').map((key) => (
										<td key={key} style={{ padding: 8, borderBottom: '1px solid #232326', fontSize: 14, maxWidth: 300, overflow: 'auto', wordBreak: 'break-all', color: '#fff' }}>
											{key === 'name' ? (
												<a href={`playground/user/${encodeURIComponent(entry[key])}`} style={{ color: '#60a5fa', textDecoration: 'underline', cursor: 'pointer' }}>{entry[key]}</a>
											) : key.startsWith('audio_') && typeof entry[key] === 'string' && entry[key].startsWith('data:audio') ? (
												<audio controls src={entry[key]} style={{ width: '100%' }} />
											) : typeof entry[key] === 'object' ? JSON.stringify(entry[key]) : String(entry[key])}
										</td>
									))}
									<td style={{ padding: 8, borderBottom: '1px solid #232326', color: '#fff' }}>
										<button onClick={() => handleDeletePlayground(entry._id)} style={{ color: '#e74c3c', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 16, marginRight: 8 }}>Delete</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		)}
		{/* Production Table */}
		{productionEntries.length > 0 && (
			<div style={{ margin: '3rem auto', maxWidth: 1200 }}>
				<h2 style={{ marginBottom: 16, color: '#fff' }}>Production Data</h2>
				<div style={{ overflowX: 'auto' }}>
					<table style={{ borderCollapse: 'collapse', width: '100%', background: '#18181b', borderRadius: 8, color: '#fff' }}>
						<thead>
							<tr>
								{Object.keys(productionEntries[0]).filter(k => k !== '_id' && k !== '__v' && k !== 'media').map((key) => (
									<th key={key} style={{ padding: 8, borderBottom: '1px solid #333', background: '#27272a', fontWeight: 600, color: '#a3e635' }}>{key}</th>
								))}
							</tr>
						</thead>
						<tbody>
							{productionEntries.map((entry, idx) => (
								<tr key={entry._id || idx} style={{ background: idx % 2 === 0 ? '#18181b' : '#232326' }}>
									{Object.keys(productionEntries[0]).filter(k => k !== '_id' && k !== '__v' && k !== 'media').map((key) => (
										<td key={key} style={{ padding: 8, borderBottom: '1px solid #232326', fontSize: 14, maxWidth: 300, overflow: 'auto', wordBreak: 'break-all', color: '#fff' }}>
											{key === 'name' ? (
												<a href={`production/user/${encodeURIComponent(entry[key])}`} style={{ color: '#60a5fa', textDecoration: 'underline', cursor: 'pointer' }}>{entry[key]}</a>
											) : key.startsWith('audio_') && typeof entry[key] === 'string' && entry[key].startsWith('data:audio') ? (
												<audio controls src={entry[key]} style={{ width: '100%' }} />
											) : typeof entry[key] === 'object' ? JSON.stringify(entry[key]) : String(entry[key])}
										</td>
									))}
									<td style={{ padding: 8, borderBottom: '1px solid #232326', color: '#fff' }}>
										<button onClick={() => handleDeleteProduction(entry._id)} style={{ color: '#e74c3c', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 16, marginRight: 8 }}>Delete</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		)}
	</div>
);
};

export default Dashboard;
