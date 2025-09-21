"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const Admin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!username || !password) {
      setMessage('Username and password are required.');
      return;
    }
    console.log('Login attempt:', { username, password });
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Login successful!');
        router.push('/dashboard');
      } else {
        setMessage(data.message || 'Login failed');
      }
    } catch (err) {
      setMessage('Server error');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!username || !password) {
      setMessage('Username and password are required.');
      return;
    }
    setIsRegistering(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Registration successful! You can now log in.');
      } else {
        setMessage(data.message || 'Registration failed');
      }
    } catch (err) {
      setMessage('Server error');
    }
    setIsRegistering(false);
  };

return (
	<div style={{
		minHeight: '100vh',
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		background: 'linear-gradient(135deg, #ece9ff 0%, #cfd9df 100%)',
		fontFamily: 'Segoe UI, Arial, sans-serif'
	}}>
		<div style={{
			background: '#fff',
			padding: '2.5rem 2rem',
			borderRadius: '18px',
			boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
			minWidth: '340px',
			maxWidth: '90%',
			textAlign: 'center'
		}}>
			<h1 style={{
				marginBottom: '0.5rem',
				fontWeight: 700,
				fontSize: '2.2rem',
				color: '#3a3a5a',
				letterSpacing: '1px'
			}}>Admin Panel</h1>
			<p style={{ color: '#7a7a8c', marginBottom: '2rem' }}>Welcome to the admin panel.</p>
			<form onSubmit={handleSubmit}>
				<div style={{ marginBottom: '1.2rem' }}>
					<input
						type="text"
						placeholder="Username"
						value={username}
						onChange={e => setUsername(e.target.value)}
						style={{
							padding: '0.7rem 1rem',
							width: '100%',
							borderRadius: '8px',
							border: '1px solid #d1d5db',
							fontSize: '1rem',
							outline: 'none',
							transition: 'border 0.2s',
							boxSizing: 'border-box'
						}}
						required
					/>
				</div>
				<div style={{ marginBottom: '1.2rem' }}>
					<input
						type="password"
						placeholder="Password"
						value={password}
						onChange={e => setPassword(e.target.value)}
						style={{
							padding: '0.7rem 1rem',
							width: '100%',
							borderRadius: '8px',
							border: '1px solid #d1d5db',
							fontSize: '1rem',
							outline: 'none',
							transition: 'border 0.2s',
							boxSizing: 'border-box'
						}}
						required
					/>
				</div>
				<button
					type="submit"
					style={{
						padding: '0.7rem 2.5rem',
						background: 'linear-gradient(90deg, #6a82fb 0%, #fc5c7d 100%)',
						color: '#fff',
						border: 'none',
						borderRadius: '8px',
						fontWeight: 600,
						fontSize: '1.1rem',
						cursor: 'pointer',
						boxShadow: '0 2px 8px rgba(108, 99, 255, 0.12)',
						transition: 'background 0.2s',
						marginRight: '1rem'
					}}
				>
					Login
				</button>
				<button
					onClick={handleRegister}
					disabled={isRegistering}
					style={{
						padding: '0.7rem 2.5rem',
						background: 'linear-gradient(90deg, #10b981 0%, #3b82f6 100%)',
						color: '#fff',
						border: 'none',
						borderRadius: '8px',
						fontWeight: 600,
						fontSize: '1.1rem',
						cursor: isRegistering ? 'not-allowed' : 'pointer',
						boxShadow: '0 2px 8px rgba(16, 185, 129, 0.12)',
						transition: 'background 0.2s'
					}}
				>
					{isRegistering ? 'Registering...' : 'Register'}
				</button>
			</form>
			{message && (
				<div style={{
					marginTop: '1.5rem',
					color: message.includes('successful') ? '#22bb33' : '#e74c3c',
					fontWeight: 500,
					fontSize: '1.05rem',
					letterSpacing: '0.5px'
				}}>
					{message}
				</div>
			)}
		</div>
	</div>
);
};

export default Admin;
