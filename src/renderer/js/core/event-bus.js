/**
 * Event Bus - Sistema di comunicazione centralizzato
 * Implementa pattern Observer per comunicazione tra componenti
 */
class EventBus {
  constructor() {
    this.events = new Map();
    this.debug = false;
  }

  /**
   * Subscribe to an event
   * @param {string} eventName - Nome dell'evento
   * @param {function} callback - Callback da eseguire
   * @param {object} options - Opzioni (once, priority)
   */
  on(eventName, callback, options = {}) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }

    const listener = {
      callback,
      once: options.once || false,
      priority: options.priority || 0,
      id: this.generateId(),
    };

    const listeners = this.events.get(eventName);
    listeners.push(listener);

    // Sort by priority (higher first)
    listeners.sort((a, b) => b.priority - a.priority);

    if (this.debug) {
      console.log(`EventBus: Registered listener for "${eventName}"`, listener);
    }

    // Return unsubscribe function
    return () => this.off(eventName, listener.id);
  }

  /**
   * Subscribe to an event only once
   */
  once(eventName, callback, options = {}) {
    return this.on(eventName, callback, { ...options, once: true });
  }

  /**
   * Unsubscribe from an event
   * @param {string} eventName - Nome dell'evento
   * @param {string|function} callbackOrId - Callback o ID del listener
   */
  off(eventName, callbackOrId) {
    if (!this.events.has(eventName)) return;

    const listeners = this.events.get(eventName);
    const index = listeners.findIndex(
      (listener) =>
        listener.callback === callbackOrId || listener.id === callbackOrId
    );

    if (index !== -1) {
      listeners.splice(index, 1);

      if (listeners.length === 0) {
        this.events.delete(eventName);
      }

      if (this.debug) {
        console.log(`EventBus: Removed listener for "${eventName}"`);
      }
    }
  }

  /**
   * Emit an event
   * @param {string} eventName - Nome dell'evento
   * @param {any} data - Dati da passare ai listener
   * @returns {Promise|any} - Promise se ci sono listener async, altrimenti void
   */
  emit(eventName, data = null) {
    if (this.debug) {
      console.log(`EventBus: Emitting "${eventName}"`, data);
    }

    if (!this.events.has(eventName)) {
      if (this.debug) {
        console.log(`EventBus: No listeners for "${eventName}"`);
      }
      return null;
    }

    const listeners = this.events.get(eventName).slice(); // Copy array
    const toRemove = [];
    const results = [];

    for (const listener of listeners) {
      try {
        const result = listener.callback(data, eventName);

        // Se il listener ritorna una Promise, la gestiamo
        if (result && typeof result.then === "function") {
          results.push(result);
        }

        if (listener.once) {
          toRemove.push(listener.id);
        }
      } catch (error) {
        console.error(`EventBus: Error in listener for "${eventName}":`, error);
      }
    }

    // Remove one-time listeners
    toRemove.forEach((id) => this.off(eventName, id));

    // Se ci sono Promise, ritorna la prima (per eventi come modal:input)
    if (results.length > 0) {
      return results[0];
    }

    return null;
  }

  /**
   * Remove all listeners for an event or all events
   * @param {string} eventName - Nome dell'evento (optional)
   */
  clear(eventName = null) {
    if (eventName) {
      this.events.delete(eventName);
      if (this.debug) {
        console.log(`EventBus: Cleared all listeners for "${eventName}"`);
      }
    } else {
      this.events.clear();
      if (this.debug) {
        console.log("EventBus: Cleared all listeners");
      }
    }
  }

  /**
   * Get all event names
   */
  getEventNames() {
    return Array.from(this.events.keys());
  }

  /**
   * Get listener count for an event
   */
  getListenerCount(eventName) {
    return this.events.has(eventName) ? this.events.get(eventName).length : 0;
  }

  /**
   * Enable/disable debug mode
   */
  setDebug(enabled) {
    this.debug = enabled;
    console.log(`EventBus: Debug mode ${enabled ? "enabled" : "disabled"}`);
  }

  /**
   * Generate unique ID for listeners
   */
  generateId() {
    return `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create a namespaced event bus
   * Useful for isolated modules
   */
  namespace(name) {
    return {
      on: (event, callback, options) =>
        this.on(`${name}:${event}`, callback, options),
      once: (event, callback, options) =>
        this.once(`${name}:${event}`, callback, options),
      off: (event, callbackOrId) => this.off(`${name}:${event}`, callbackOrId),
      emit: (event, data) => this.emit(`${name}:${event}`, data),
      clear: (event) => this.clear(event ? `${name}:${event}` : null),
    };
  }

  /**
   * Wait for an event to be emitted
   * Returns a Promise that resolves when the event is emitted
   */
  waitFor(eventName, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.off(eventName, listener);
        reject(new Error(`Timeout waiting for event "${eventName}"`));
      }, timeout);

      const listener = (data) => {
        clearTimeout(timer);
        resolve(data);
      };

      this.once(eventName, listener);
    });
  }

  /**
   * Create a proxy that automatically emits events on property changes
   */
  createReactiveProxy(target, eventPrefix = "change") {
    return new Proxy(target, {
      set: (obj, prop, value) => {
        const oldValue = obj[prop];
        obj[prop] = value;

        if (oldValue !== value) {
          this.emit(`${eventPrefix}:${prop}`, {
            property: prop,
            oldValue,
            newValue: value,
            target: obj,
          });
        }

        return true;
      },
    });
  }
}

// Create singleton instance
const eventBus = new EventBus();

// Enable debug in development
if (
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
) {
  eventBus.setDebug(true);
}

export default eventBus;
