import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000'); // Connect to backend

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [users, setUsers] = useState([]);
    const [currentRecipient, setCurrentRecipient] = useState('');
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState({}); // {username: [messages]}

    const handleLogin = () => {
        if (username.trim() !== '') {
            socket.emit('login', username);
            setIsLoggedIn(true);
        }
    };

    const sendMessage = () => {
        if (message.trim() !== '' && currentRecipient) {
            const msgData = { toUsername: currentRecipient, message };
            socket.emit('private_message', msgData);

            setChatHistory((prev) => ({
                ...prev,
                [currentRecipient]: [
                    ...(prev[currentRecipient] || []),
                    { from: 'You', message },
                ],
            }));
            setMessage('');
        }
    };

    useEffect(() => {
        socket.on('user_list', (userList) => {
            setUsers(userList.filter((user) => user !== username)); // Exclude self
        });

        socket.on('receive_private_message', ({ from, message }) => {
            setChatHistory((prev) => ({
                ...prev,
                [from]: [...(prev[from] || []), { from, message }],
            }));
        });

        return () => {
            socket.off('user_list');
            socket.off('receive_private_message');
        };
    }, [username]);

    if (!isLoggedIn) {
        return (
            <div style={{ textAlign: 'center', marginTop: '50px', backgroundColor: 'steelblue', height: '100vh' }}>
                <h1 style={{ color: '#fff' }}>Realtime Chat APP</h1>
                <input
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{ padding: '10px', width: '300px', marginBottom: '20px' }}
                />
                <button
                    onClick={handleLogin}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#fff',
                        color: '#007BFF',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}
                >
                    Login
                </button>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: 'steelblue' }}>
            {/* User List */}
            <div style={{ width: '30%', borderRight: '1px solid #ccc', padding: '10px', backgroundColor: '#fff' }}>
                <h2>Users</h2>
                <ul>
                    {users.map((user, index) => (
                        <li
                            key={index}
                            onClick={() => setCurrentRecipient(user)}
                            style={{
                                padding: '10px',
                                cursor: 'pointer',
                                backgroundColor: currentRecipient === user ? '#007BFF' : '#f0f0f0',
                                color: currentRecipient === user ? '#fff' : '#000',
                                borderRadius: '5px',
                                marginBottom: '5px',
                            }}
                        >
                            {user}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Chat Area */}
            <div style={{ flex: '1', padding: '10px', backgroundColor: '#f9f9f9' }}>
                <h2 style={{ color: '#000' }}>Chat with {currentRecipient || '...'}</h2>
                <div
                    style={{
                        height: '70%',
                        overflowY: 'scroll',
                        border: '1px solid #ccc',
                        padding: '10px',
                        marginBottom: '10px',
                        backgroundColor: '#fff',
                    }}
                >
                    {(chatHistory[currentRecipient] || []).map((msg, index) => (
                        <div
                            key={index}
                            style={{
                                marginBottom: '10px', // Each message has a new line
                                textAlign: msg.from === 'You' ? 'right' : 'left',
                            }}
                        >
                            <div
                                style={{
                                    backgroundColor: msg.from === 'You' ? '#007BFF' : '#E5E5EA',
                                    color: '#000', // Black text color
                                    display: 'inline-block',
                                    padding: '10px',
                                    borderRadius: '10px',
                                    maxWidth: '70%',
                                    wordWrap: 'break-word',
                                }}
                            >
                                <strong>{msg.from}:</strong> {msg.message}
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                        type="text"
                        placeholder="Type a message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        style={{
                            flex: '1',
                            padding: '10px',
                            borderRadius: '5px',
                            border: '1px solid #ccc',
                        }}
                    />
                    <button
                        onClick={sendMessage}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#007BFF',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                        }}
                        disabled={!currentRecipient}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default App;
