import { EventEmitter } from 'events';

class SSEManager extends EventEmitter {
  private static instance: SSEManager;
  
  private constructor() {
    super();
    this.setMaxListeners(0); // Sin límite de listeners
  }
  
  static getInstance(): SSEManager {
    if (!SSEManager.instance) {
      SSEManager.instance = new SSEManager();
    }
    return SSEManager.instance;
  }
  
  sendNotification(userId: string, notification: any) {
    console.log(`📨 Emitting notification to user ${userId}:`, notification.titulo);
    this.emit(`notification:${userId}`, notification);
  }
  
  getConnectionCount(): number {
    return this.listenerCount('notification');
  }
}

export const sseManager = SSEManager.getInstance();
