// External Dependencies
import express from 'express';
import morgan from 'morgan';
import http from 'http';
import path from 'path';

// Internal Dependencies
import __dirname from './utils/getDirname.js';
import TTT_Socket from './classes/Socket.js';
import { router as htmlRoutes } from './routes/staticRoutes.js';

// Server setup
const PORT = process.env.PORT || 3001;
const app = express();
const server = http.createServer(app);

// Create WebSocket Instance
new TTT_Socket(server);

// Serve static assets
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(morgan('tiny'));
app.use('/', htmlRoutes);

// 404 Route
app.use((_, res) => {
	res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Start server
server.listen(PORT, () => {
	console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
