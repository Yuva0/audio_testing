import React from 'react';
import Link from 'next/link';

const Homepage = () => {
return (
	<div style={{ textAlign: 'center', marginTop: '3rem' }}>
		<h1>Welcome to Audio Testing</h1>
		<div style={{ margin: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
			<Link href="/playground">
				<button
					style={{
						padding: '0.75rem 2rem',
						fontSize: '1rem',
						borderRadius: '8px',
						border: 'none',
						background: '#0070f3',
						color: '#fff',
						cursor: 'pointer',
						boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
						transition: 'background 0.2s',
					}}
				>
					Playground
				</button>
			</Link>
			<Link href="/production">
				<button
					style={{
						padding: '0.75rem 2rem',
						fontSize: '1rem',
						borderRadius: '8px',
						border: 'none',
						background: '#10b981',
						color: '#fff',
						cursor: 'pointer',
						boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
						transition: 'background 0.2s',
					}}
				>
					Production
				</button>
			</Link>
		</div>
		<div>
			<Link href="/admin">Go to Admin Page</Link>
		</div>
	</div>
);
};

export default Homepage;