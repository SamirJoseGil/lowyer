import { Server as SocketIOServer } from 'socket.io';
import { db } from '../db.server';
import { notifyNewMessage } from '../notifications/notification-sender.server';

export class WebSocketServer {
  private io: SocketIOServer;
  
  constructor(httpServer: any) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        credentials: true
      }
    });
    
    this.setupEventHandlers();
  }
  
  private setupEventHandlers() {
    this.io.on('connection', async (socket) => {
      const userId = socket.handshake.auth.userId;
      console.log(`🔌 User ${userId} connected via WebSocket`);
      
      // Actualizar presencia a online
      await this.updatePresence(userId, 'online', socket.id);
      
      // Unirse a room personal
      socket.join(`user:${userId}`);
      
      // Handlers de eventos
      socket.on('join-chat', async (chatSessionId: string) => {
        await this.handleJoinChat(socket, userId, chatSessionId);
      });
      
      socket.on('send-message', async (data) => {
        await this.handleSendMessage(socket, userId, data);
      });
      
      socket.on('typing', (chatSessionId: string) => {
        this.handleTyping(socket, userId, chatSessionId);
      });
      
      socket.on('stop-typing', (chatSessionId: string) => {
        this.handleStopTyping(socket, userId, chatSessionId);
      });
      
      socket.on('message-read', async (messageId: string) => {
        await this.handleMessageRead(socket, userId, messageId);
      });
      
      socket.on('disconnect', async () => {
        await this.updatePresence(userId, 'offline');
        console.log(`🔌 User ${userId} disconnected`);
      });
    });
  }
  
  private async handleJoinChat(socket: any, userId: string, chatSessionId: string) {
    // Verificar acceso a la sesión
    const session = await db.chatSession.findFirst({
      where: {
        id: chatSessionId,
        OR: [
          { userId },
          { lawyer: { userId } }
        ]
      }
    });
    
    if (!session) {
      socket.emit('error', { message: 'No tienes acceso a esta sesión' });
      return;
    }
    
    // Unirse al room del chat
    socket.join(`chat:${chatSessionId}`);
    
    // Notificar a otros participantes
    socket.to(`chat:${chatSessionId}`).emit('user-joined', { userId });
    
    console.log(`👤 User ${userId} joined chat ${chatSessionId}`);
  }
  
  private async handleSendMessage(socket: any, userId: string, data: any) {
    const { chatSessionId, content, senderRole } = data;
    
    // Validar y crear mensaje en BD
    const message = await db.message.create({
      data: {
        chatSessionId,
        senderId: userId,
        senderRole,
        content,
        status: 'sent',
        deliveredAt: new Date()
      },
      include: {
        sender: {
          include: {
            profile: true
          }
        }
      }
    });
    
    // Emitir a todos en el room
    this.io.to(`chat:${chatSessionId}`).emit('new-message', message);
    
    // Actualizar última actividad
    await db.chatSession.update({
      where: { id: chatSessionId },
      data: {
        lastMessageAt: new Date(),
        unreadCount: { increment: 1 }
      }
    });
    
    // Enviar notificación
    const session = await db.chatSession.findUnique({
      where: { id: chatSessionId },
      include: { user: true, lawyer: { include: { user: true } } }
    });
    
    if (session) {
      const recipientId = userId === session.userId ? session.lawyer?.userId : session.userId;
      if (recipientId) {
        const senderName = message.sender?.profile?.firstName || 'Usuario';
        await notifyNewMessage(recipientId, senderName, chatSessionId);
      }
    }
    
    console.log(`💬 Message sent in chat ${chatSessionId}`);
  }
  
  private handleTyping(socket: any, userId: string, chatSessionId: string) {
    socket.to(`chat:${chatSessionId}`).emit('user-typing', { userId });
  }
  
  private handleStopTyping(socket: any, userId: string, chatSessionId: string) {
    socket.to(`chat:${chatSessionId}`).emit('user-stop-typing', { userId });
  }
  
  private async handleMessageRead(socket: any, userId: string, messageId: string) {
    await db.message.update({
      where: { id: messageId },
      data: { readAt: new Date() }
    });
    
    const message = await db.message.findUnique({
      where: { id: messageId },
      select: { chatSessionId: true, senderId: true }
    });
    
    if (message && message.senderId) {
      this.io.to(`user:${message.senderId}`).emit('message-read', { messageId });
    }
  }
  
  private async updatePresence(
    userId: string,
    status: 'online' | 'offline' | 'away' | 'busy',
    socketId?: string
  ) {
    await db.presenciaUsuario.upsert({
      where: { userId },
      update: {
        status,
        socketId,
        lastSeenAt: new Date()
      },
      create: {
        userId,
        status,
        socketId
      }
    });
    
    this.io.emit('presence-change', { userId, status });
  }
  
  sendToUser(userId: string, event: string, data: any) {
    this.io.to(`user:${userId}`).emit(event, data);
  }
}

let wsServer: WebSocketServer | null = null;

export function initializeWebSocketServer(httpServer: any) {
  if (!wsServer) {
    wsServer = new WebSocketServer(httpServer);
  }
  return wsServer;
}

export function getWebSocketServer() {
  if (!wsServer) {
    throw new Error('WebSocket server not initialized');
  }
  return wsServer;
}
