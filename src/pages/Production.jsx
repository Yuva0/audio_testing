import React, { useState, useRef } from 'react';

const Production = () => {
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [mediaList, setMediaList] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showing, setShowing] = useState(false);
  const [audioError, setAudioError] = useState('');
  const [audioAllowed, setAudioAllowed] = useState(false);
  const [audioMap, setAudioMap] = useState({});
  const [timeMap, setTimeMap] = useState({});
  const timeMapRef = useRef({});
  const [audioTimeMap, setAudioTimeMap] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const [nameExists, setNameExists] = useState(false);
  const timerRef = useRef();
  const mediaRecorderRef = useRef();
  const audioChunksRef = useRef([]);
  const timerStartRef = useRef(null);

  React.useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => setAudioAllowed(true))
      .catch(() => setAudioError('Microphone permission denied. Please allow audio recording to continue.'));
  }, []);

  React.useEffect(() => {
    if (!showing) return;
    const handleSpace = (e) => {
      if (e.code === 'Space') {
        const idx = currentIdx;
        if (timerStartRef.current !== null && typeof idx === 'number') {
          const elapsed = Date.now() - timerStartRef.current;
          setTimeMap((prev) => {
            const updated = { ...prev, [`time_${idx + 1}`]: elapsed };
            timeMapRef.current = updated;
            return updated;
          });
          timerStartRef.current = null;
        }
      }
    };
    window.addEventListener('keydown', handleSpace);
    return () => window.removeEventListener('keydown', handleSpace);
  }, [showing, currentIdx]);

  const showNext = async (idx, list, audioMapArg, productionIdRef, timeMapArg = {}, audioTimeMapArg = {}) => {
    if (idx >= list.length) {
      setShowing(false);
      setUploading(true);
      if (productionIdRef.current) {
        await fetch('/api/production', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: productionIdRef.current, ...timeMapRef.current, ...audioTimeMapArg }),
        });
        for (const [key, value] of Object.entries(audioMapArg)) {
          await fetch('/api/production', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: productionIdRef.current, [key]: value }),
          });
        }
      }
      setUploading(false);
      setUploadDone(true);
      return;
    }
    setCurrentIdx(idx);
    setTimeout(async () => {
      const item = list[idx];
      let duration = 10000;
      if (item.type.startsWith('video/')) {
        duration = 10000;
      }
      let audioTimerStart = Date.now();
      let audioTime = null;
      let audioBase64 = null;
      let audioStopped = false;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new window.MediaRecorder(stream);
        audioChunksRef.current = [];
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        source.connect(analyser);
        analyser.fftSize = 2048;
        const dataArray = new Uint8Array(analyser.fftSize);
        function checkVolume() {
          if (audioStopped) return;
          analyser.getByteTimeDomainData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            const val = (dataArray[i] - 128) / 128;
            sum += val * val;
          }
          const rms = Math.sqrt(sum / dataArray.length);
          if (rms > 0.08 && audioTime === null) {
            audioTime = Date.now() - audioTimerStart;
            setAudioTimeMap((prev) => ({ ...prev, [`audio_time_${idx + 1}`]: audioTime }));
          }
          requestAnimationFrame(checkVolume);
        }
        requestAnimationFrame(checkVolume);
        mediaRecorder.onstop = async () => {
          audioStopped = true;
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.onloadend = () => {
            audioBase64 = reader.result;
            const newAudioMap = { ...audioMapArg, [`audio_${idx + 1}`]: audioBase64 };
            const newTimeMap = { ...timeMapRef.current, [`time_${idx + 1}`]: timeMapRef.current[`time_${idx + 1}`] ?? null };
            const newAudioTimeMap = { ...audioTimeMapArg, [`audio_time_${idx + 1}`]: audioTime ?? null };
            setAudioMap(newAudioMap);
            setTimeMap(newTimeMap);
            setAudioTimeMap(newAudioTimeMap);
            showNext(
              idx + 1,
              list,
              newAudioMap,
              productionIdRef,
              newTimeMap,
              newAudioTimeMap
            );
          };
          reader.readAsDataURL(audioBlob);
        };
        mediaRecorder.start();
        timerStartRef.current = Date.now();
        setTimeout(() => {
          audioStopped = true;
          mediaRecorder.stop();
          stream.getTracks().forEach(track => track.stop());
          audioContext.close();
        }, duration);
      } catch (err) {
        setAudioError('Microphone permission denied or error during recording.');
        setShowing(false);
      }
    }, 0);
  };

  const productionIdRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const checkRes = await fetch(`/api/production?name=${encodeURIComponent(name)}`);
    const checkData = await checkRes.json();
    if (checkData.success && checkData.entry) {
      setNameExists(true);
      return;
    }
    setNameExists(false);
    setSubmitted(true);
    const res = await fetch('/api/media');
    const data = await res.json();
    if (data.success) {
      setMediaList(data.media);
      setCurrentIdx(0);
      setShowing(true);
      const postRes = await fetch('/api/production', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, media: data.media.map(m => m._id) }),
      });
      const postData = await postRes.json();
      if (postData.success && postData.id) {
        productionIdRef.current = postData.id;
        showNext(0, data.media, {}, productionIdRef);
      } else {
        setAudioError('Failed to create production entry.');
        setShowing(false);
      }
    }
  };

  React.useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  if (!submitted) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '80vh', 
        borderRadius: 16,
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        padding: '2rem'
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 700, 
          marginBottom: '2rem', 
          color: '#ffffff', 
          letterSpacing: 1 
        }}>
          Production
        </h1>
        {audioError && (
          <div style={{ color: '#e74c3c', marginBottom: 24, fontWeight: 600, fontSize: 18 }}>{audioError}</div>
        )}
        {nameExists && (
          <div style={{ color: '#e74c3c', marginBottom: 16, fontWeight: 600, fontSize: 18 }}>Name already exists. Please choose another.</div>
        )}
        <form 
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            background: '#fff',
            padding: '2rem 2.5rem',
            borderRadius: 12,
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            gap: 20
          }}
        >
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            disabled={!audioAllowed}
            style={{ 
              padding: '14px 18px', 
              fontSize: 20, 
              borderRadius: 8, 
              border: '1.5px solid #a0aec0', 
              outline: 'none',
              minWidth: 240,
              background: '#f8fafc',
              color: '#111827',
              transition: 'border 0.2s',
            }}
          />
          <button 
            type="submit" 
            disabled={!audioAllowed}
            style={{ 
              padding: '14px 36px', 
              borderRadius: 8, 
              background: 'linear-gradient(90deg, #6366f1 0%, #60a5fa 100%)', 
              color: '#fff', 
              fontWeight: 700, 
              fontSize: 20, 
              border: 'none',
              boxShadow: '0 2px 8px rgba(99,102,241,0.10)',
              cursor: audioAllowed ? 'pointer' : 'not-allowed',
              transition: 'background 0.2s'
            }}
          >
            Submit
          </button>
        </form>
      </div>
    );
  }

  if (showing && mediaList.length > 0) {
    const item = mediaList[currentIdx];
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100vw',
        height: '100vh',
        background: '#111827',
        padding: 24,
        boxSizing: 'border-box',
      }}>
        {item.type.startsWith('image/') && item.data && (
          <img
            src={item.data}
            alt=""
            style={{
              maxWidth: '100vw',
              maxHeight: '100vh',
              width: '100vw',
              height: '100vh',
              objectFit: 'contain',
              borderRadius: 12,
              display: 'block',
              margin: 'auto',
              background: '#222',
            }}
          />
        )}
        {item.type.startsWith('video/') && (item.videoUrl || item.data) && (
          <video
            src={item.videoUrl || item.data}
            controls
            autoPlay
            style={{
              maxWidth: '100vw',
              maxHeight: '100vh',
              width: '100vw',
              height: '100vh',
              objectFit: 'contain',
              borderRadius: 12,
              display: 'block',
              margin: 'auto',
              background: '#222',
            }}
          />
        )}
      </div>
    );
  }

  if (uploading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', color: '#fff', fontSize: 24 }}>
        <div className="loader" style={{ marginBottom: 24 }} />
        Uploading data, please wait...
      </div>
    );
  }

  if (submitted && !showing && uploadDone) {
    return (
      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <h2>Thank you, {name}! All media have been shown and your data has been uploaded.</h2>
      </div>
    );
  }

  return null;
};

export default Production;
