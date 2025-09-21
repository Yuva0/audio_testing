import mongoose from 'mongoose';
import React, { useEffect, useState } from 'react';

const UserPage = ({ params }) => {
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const name = decodeURIComponent(params.id);

  useEffect(() => {
    const fetchEntry = async () => {
      const res = await fetch(`/api/playground?name=${encodeURIComponent(name)}`);
      const data = await res.json();
      if (data.success && data.entry) setEntry(data.entry);
      setLoading(false);
    };
    fetchEntry();
  }, [name]);

  if (loading) return <div style={{ color: '#fff', textAlign: 'center', marginTop: 40 }}>Loading...</div>;
  if (!entry) return <div style={{ color: '#fff', textAlign: 'center', marginTop: 40 }}>No entry found for {name}</div>;

  return (
    <div style={{ color: '#fff', maxWidth: 900, margin: '2rem auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 24 }}>Playground Entry: {entry.name}</h1>
      <table style={{ width: '100%', background: '#222', borderRadius: 8, color: '#a3e635', marginTop: 24, borderCollapse: 'separate', borderSpacing: 0, boxShadow: '0 2px 12px rgba(0,0,0,0.12)' }}>
        <tbody>
          {Object.entries(entry)
            .filter(([key]) => key !== '_id' && key !== '__v' && key !== 'media')
            .map(([key, value]) => {
              // Format time fields as seconds with two decimals
              const isTimeField = key.toLowerCase().includes('time') && typeof value === 'number' && value !== null;
              const formatSeconds = (ms) => {
                if (ms == null) return '—';
                return (ms / 1000).toFixed(2) + ' s';
              };
              return (
                <tr key={key}>
                  <td style={{ padding: '14px 12px', fontWeight: 600, borderBottom: '1px solid #333', width: 180, textAlign: 'right', verticalAlign: 'top', background: '#18181b' }}>{key}</td>
                  <td style={{ padding: '14px 12px', borderBottom: '1px solid #333', background: '#232326', textAlign: 'left' }}>
                    {typeof value === 'string' && value.startsWith('data:audio') ? (
                      <>
                        <audio controls src={value} style={{ width: 300, marginRight: 16, verticalAlign: 'middle' }} />
                        <a
                          href={value}
                          download={`${entry.name}_${key}.webm`}
                          style={{
                            color: '#fff',
                            background: '#60a5fa',
                            padding: '6px 16px',
                            borderRadius: 6,
                            textDecoration: 'none',
                            fontWeight: 600,
                            fontSize: 14,
                            marginLeft: 8,
                          }}
                        >
                          Download
                        </a>
                      </>
                    ) : isTimeField ? (
                      formatSeconds(value)
                    ) : Array.isArray(value) ? (
                      <pre style={{ margin: 0, color: '#a3e635', background: 'none', fontSize: 14 }}>{JSON.stringify(value, null, 2)}</pre>
                    ) : typeof value === 'object' && value !== null ? (
                      <pre style={{ margin: 0, color: '#a3e635', background: 'none', fontSize: 14 }}>{JSON.stringify(value, null, 2)}</pre>
                    ) : key.toLowerCase().includes('date') || key.toLowerCase().includes('createdat') ? (
                      new Date(value).toLocaleString()
                    ) : String(value)}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};

export default UserPage;

export async function getServerSideProps(context) {
  return { props: { params: context.params } };
}
