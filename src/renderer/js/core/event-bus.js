/**
 * Event Bus - Versione essenziale e performante
 * Solo le funzionalità necessarie, niente di più
 */
class EventBus {
  constructor() {
    this.events = new Map();
  }

  /**
   * Ascolta un evento
   */
  on(eventName, callback) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, new Set());
    }

    this.events.get(eventName).add(callback);

    // Return unsubscribe function
    return () => this.off(eventName, callback);
  }

  /**
   * Ascolta un evento una sola volta
   */
  once(eventName, callback) {
    const unsubscribe = this.on(eventName, (data) => {
      unsubscribe();
      callback(data);
    });

    return unsubscribe;
  }

  /**
   * Rimuovi listener
   */
  off(eventName, callback) {
    if (this.events.has(eventName)) {
      this.events.get(eventName).delete(callback);

      // Clean up empty event sets
      if (this.events.get(eventName).size === 0) {
        this.events.delete(eventName);
      }
    }
  }

  /**
   * Emetti evento
   */
  emit(eventName, data = null) {
    if (!this.events.has(eventName)) return null;

    const listeners = this.events.get(eventName);
    let result = null;

    for (const callback of listeners) {
      try {
        const callbackResult = callback(data);
        if (result === null && callbackResult !== undefined) {
          result = callbackResult;
        }
      } catch (error) {
        console.error(`EventBus error in ${eventName}:`, error);
      }
    }

    return result;
  }

  /**
   * Rimuovi tutti i listener
   */
  clear(eventName = null) {
    if (eventName) {
      this.events.delete(eventName);
    } else {
      this.events.clear();
    }
  }

  /**
   * Debug info
   */
  getListenerCount(eventName) {
    return this.events.has(eventName) ? this.events.get(eventName).size : 0;
  }
}

// Singleton
const eventBus = new EventBus();
export default eventBus;
