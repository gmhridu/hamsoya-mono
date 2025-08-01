/**
 * Offline Queue System
 * Handles cart and bookmark operations when offline
 * Queues operations and syncs when back online
 */

interface QueuedOperation {
  id: string;
  type: 'cart' | 'bookmarks';
  operation: 'add' | 'remove' | 'update' | 'clear' | 'toggle';
  data: any;
  timestamp: number;
  retries: number;
}

class OfflineQueue {
  private queue: QueuedOperation[] = [];
  private isOnline = true;
  private isProcessing = false;
  private maxRetries = 3;
  private retryDelay = 1000;

  constructor() {
    if (typeof window !== 'undefined') {
      // Load queue from localStorage
      this.loadQueue();

      // Listen for online/offline events
      window.addEventListener('online', this.handleOnline.bind(this));
      window.addEventListener('offline', this.handleOffline.bind(this));

      // Set initial online status
      this.isOnline = navigator.onLine;

      // Process queue on initialization if online
      if (this.isOnline) {
        this.processQueue();
      }
    }
  }

  /**
   * Add operation to queue
   */
  addToQueue(operation: Omit<QueuedOperation, 'id' | 'timestamp' | 'retries'>) {
    const queuedOp: QueuedOperation = {
      ...operation,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retries: 0,
    };

    this.queue.push(queuedOp);
    this.saveQueue();

    // Process immediately if online
    if (this.isOnline) {
      this.processQueue();
    }
  }

  /**
   * Handle online event
   */
  private handleOnline() {
    this.isOnline = true;
    this.processQueue();
  }

  /**
   * Handle offline event
   */
  private handleOffline() {
    this.isOnline = false;
  }

  /**
   * Process queued operations
   */
  private async processQueue() {
    if (!this.isOnline || this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    const operations = [...this.queue];
    
    for (const operation of operations) {
      try {
        const success = await this.executeOperation(operation);
        
        if (success) {
          // Remove from queue on success
          this.queue = this.queue.filter(op => op.id !== operation.id);
        } else {
          // Increment retry count
          const opIndex = this.queue.findIndex(op => op.id === operation.id);
          if (opIndex >= 0) {
            this.queue[opIndex].retries++;
            
            // Remove if max retries reached
            if (this.queue[opIndex].retries >= this.maxRetries) {
              console.warn('Max retries reached for operation:', operation);
              this.queue.splice(opIndex, 1);
            }
          }
        }
      } catch (error) {
        console.error('Error processing queued operation:', error);
        
        // Increment retry count on error
        const opIndex = this.queue.findIndex(op => op.id === operation.id);
        if (opIndex >= 0) {
          this.queue[opIndex].retries++;
          
          if (this.queue[opIndex].retries >= this.maxRetries) {
            this.queue.splice(opIndex, 1);
          }
        }
      }
    }

    this.saveQueue();
    this.isProcessing = false;

    // Schedule next processing if there are still items in queue
    if (this.queue.length > 0) {
      setTimeout(() => this.processQueue(), this.retryDelay);
    }
  }

  /**
   * Execute a single operation
   */
  private async executeOperation(operation: QueuedOperation): Promise<boolean> {
    try {
      let url = '';
      let method = '';
      let body: any = null;

      // Build request based on operation
      if (operation.type === 'cart') {
        switch (operation.operation) {
          case 'add':
            url = '/api/cart';
            method = 'POST';
            body = JSON.stringify(operation.data);
            break;
          case 'remove':
            url = `/api/cart?productId=${operation.data.productId}`;
            method = 'DELETE';
            break;
          case 'update':
            url = '/api/cart';
            method = 'PUT';
            body = JSON.stringify(operation.data);
            break;
          case 'clear':
            url = '/api/cart?clear=true';
            method = 'DELETE';
            break;
        }
      } else if (operation.type === 'bookmarks') {
        switch (operation.operation) {
          case 'add':
            url = '/api/bookmarks';
            method = 'POST';
            body = JSON.stringify(operation.data);
            break;
          case 'remove':
            url = `/api/bookmarks?productId=${operation.data.productId}`;
            method = 'DELETE';
            break;
          case 'toggle':
            url = '/api/bookmarks';
            method = 'PUT';
            body = JSON.stringify(operation.data);
            break;
          case 'clear':
            url = '/api/bookmarks?clear=true';
            method = 'DELETE';
            break;
        }
      }

      if (!url) {
        console.error('Unknown operation:', operation);
        return false;
      }

      const response = await fetch(url, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : {},
        body,
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to execute operation:', error);
      return false;
    }
  }

  /**
   * Save queue to localStorage
   */
  private saveQueue() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('offline_queue', JSON.stringify(this.queue));
      } catch (error) {
        console.warn('Failed to save offline queue:', error);
      }
    }
  }

  /**
   * Load queue from localStorage
   */
  private loadQueue() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('offline_queue');
        if (saved) {
          this.queue = JSON.parse(saved);
        }
      } catch (error) {
        console.warn('Failed to load offline queue:', error);
        this.queue = [];
      }
    }
  }

  /**
   * Get queue status
   */
  getStatus() {
    return {
      isOnline: this.isOnline,
      queueLength: this.queue.length,
      isProcessing: this.isProcessing,
    };
  }

  /**
   * Clear queue (for testing or manual cleanup)
   */
  clearQueue() {
    this.queue = [];
    this.saveQueue();
  }
}

// Export singleton instance
export const offlineQueue = new OfflineQueue();
