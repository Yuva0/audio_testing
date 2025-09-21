import React from 'react';

const UserEntryTable = ({ entry, title }) => (
  <div style={{ color: '#232326', maxWidth: 900, margin: '2rem auto' }}>
    <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 24 }}>{title}: {entry.name}</h1>
    <table style={{ width: '100%', background: '#fff', borderRadius: 8, color: '#232326', marginTop: 24, borderCollapse: 'separate', borderSpacing: 0, boxShadow: '0 2px 12px rgba(0,0,0,0.12)' }}>
      <tbody>
        {Object.entries(entry)
          .filter(([key]) => key !== '_id' && key !== '__v' && key !== 'media')
          .map(([key, value]) => {
            const isTimeField = key.toLowerCase().includes('time') && typeof value === 'number' && value !== null;
            const formatSeconds = (ms) => {
              if (ms == null) return '—';
              return (ms / 1000).toFixed(2) + ' s';
            };
            return (
              <tr key={key}>
                <td style={{ padding: '14px 12px', fontWeight: 600, borderBottom: '1px solid #eee', width: 180, textAlign: 'right', verticalAlign: 'top', background: '#f8fafc' }}>{key}</td>
                <td style={{ padding: '14px 12px', borderBottom: '1px solid #eee', background: '#fff', textAlign: 'left' }}>
                  {typeof value === 'string' && value.startsWith('data:audio') ? (
                    <audio controls src={value} style={{ width: 300, marginRight: 16, verticalAlign: 'middle' }} />
                  ) : isTimeField ? (
                    formatSeconds(value)
                  ) : Array.isArray(value) ? (
                    <pre style={{ margin: 0, color: '#232326', background: 'none', fontSize: 14 }}>{JSON.stringify(value, null, 2)}</pre>
                  ) : typeof value === 'object' && value !== null ? (
                    <pre style={{ margin: 0, color: '#232326', background: 'none', fontSize: 14 }}>{JSON.stringify(value, null, 2)}</pre>
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

export default UserEntryTable;
