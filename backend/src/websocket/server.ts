import { WebSocket, WebSocketServer } from 'ws';
import { Server } from 'http';
import { verifyToken } from '../utils/auth';
import { NotificationService } from '../services/NotificationService';

export function setupWebSocketServer(server: Server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', async (ws: WebSocket, req) => {
    try {
      // Get token from query string
      const url = new URL(req.url!, `http://${req.headers.host}`);
      const token = url.searchParams.get('token');

      if (!token) {
        ws.close(1008, 'Token required');
        return;
      }

      // Verify token and get user
      const user = await verifyToken(token);
      if (!user) {
        ws.close(1008, 'Invalid token');
        return;
      }

      // Add client to notification service
      NotificationService.addClient(user.id, ws);

      // Handle client disconnect
      ws.on('close', () => {
        NotificationService.removeClient(user.id);
      });

      // Handle client messages (if needed)
      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message);
          // Handle any client-to-server messages here
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      // Send initial connection success message
      ws.send(JSON.stringify({
        type: 'connection_success',
        message: 'Connected to notification service'
      }));

    } catch (error) {
      console.error('WebSocket connection error:', error);
      ws.close(1011, 'Internal server error');
    }
  });

  return wss;
} 