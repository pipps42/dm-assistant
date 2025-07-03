/**
 * Data Store - Gestione centralizzata dei dati dell'applicazione
 * Interfaccia con Electron per persistenza e fornisce API unificata
 */
import EventBus from "../core/event-bus.js";

class DataStore {
  constructor() {
    this.eventBus = EventBus;
    this.isInitialized = false;
    this.data = {
      characters: [],
      npcs: [],
      environments: [],
      monsters: [],
      encounters: [],
      settings: {},
    };

    // Cache per performance
    this.cache = new Map();
    this.lastSync = new Map();
  }

  /**
   * Initialize data store
   */
  async init() {
    if (this.isInitialized) return;

    try {
      console.log("DataStore: Initializing...");

      // Load all collections
      for (const collection of Object.keys(this.data)) {
        await this.loadCollection(collection);
      }

      this.isInitialized = true;
      this.eventBus.emit("dataStore:initialized", this.getStats());

      console.log("DataStore: Initialized successfully");
    } catch (error) {
      console.error("DataStore: Initialization failed:", error);
      throw error;
    }
  }

  /**
   * Load a collection from storage
   */
  async loadCollection(collection) {
    try {
      const data = await window.electronAPI.data.read(`${collection}.json`);
      this.data[collection] = Array.isArray(data)
        ? data
        : data || (collection === "settings" ? {} : []);
      this.lastSync.set(collection, Date.now());

      console.log(
        `DataStore: Loaded ${collection}:`,
        this.data[collection].length
      );
    } catch (error) {
      console.warn(
        `DataStore: Failed to load ${collection}, using empty:`,
        error
      );
      this.data[collection] = collection === "settings" ? {} : [];
    }
  }

  /**
   * Save a collection to storage
   */
  async saveCollection(collection) {
    try {
      await window.electronAPI.data.write(
        `${collection}.json`,
        this.data[collection]
      );
      this.lastSync.set(collection, Date.now());
      this.clearCache(collection);

      this.eventBus.emit("dataStore:saved", {
        collection,
        count: this.data[collection].length,
      });
    } catch (error) {
      console.error(`DataStore: Failed to save ${collection}:`, error);
      throw error;
    }
  }

  /**
   * Get all items from a collection
   */
  get(collection) {
    if (!this.data[collection]) {
      console.warn(`DataStore: Collection '${collection}' does not exist`);
      return collection === "settings" ? {} : [];
    }
    return this.data[collection];
  }

  /**
   * Find item by ID
   */
  findById(collection, id) {
    const cacheKey = `${collection}:${id}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const items = this.get(collection);
    const item = Array.isArray(items)
      ? items.find((item) => item.id == id)
      : null;

    if (item) {
      this.cache.set(cacheKey, item);
    }

    return item;
  }

  /**
   * Find items by criteria
   */
  find(collection, criteria = {}) {
    const items = this.get(collection);

    if (!Array.isArray(items) || Object.keys(criteria).length === 0) {
      return items;
    }

    return items.filter((item) => {
      return Object.entries(criteria).every(([key, value]) => {
        if (typeof value === "function") {
          return value(item[key]);
        }
        return item[key] === value;
      });
    });
  }

  /**
   * Add new item
   */
  async add(collection, data) {
    try {
      const items = this.get(collection);

      if (!Array.isArray(items)) {
        throw new Error(`Cannot add to non-array collection: ${collection}`);
      }

      // Generate ID if not provided
      if (!data.id) {
        data.id = this.generateId();
      }

      // Add timestamps
      data.createdAt = data.createdAt || new Date().toISOString();
      data.updatedAt = new Date().toISOString();

      // Add to collection
      items.push(data);

      // Save to storage
      await this.saveCollection(collection);

      // Emit event
      this.eventBus.emit(`dataStore:${collection}:added`, data);

      console.log(`DataStore: Added to ${collection}:`, data.id);
      return data;
    } catch (error) {
      console.error(`DataStore: Failed to add to ${collection}:`, error);
      throw error;
    }
  }

  /**
   * Update existing item
   */
  async update(collection, id, updates) {
    try {
      const items = this.get(collection);

      if (!Array.isArray(items)) {
        throw new Error(`Cannot update in non-array collection: ${collection}`);
      }

      const index = items.findIndex((item) => item.id == id);

      if (index === -1) {
        throw new Error(`Item with id ${id} not found in ${collection}`);
      }

      // Merge updates
      const oldData = { ...items[index] };
      items[index] = {
        ...items[index],
        ...updates,
        id: items[index].id, // Preserve ID
        createdAt: items[index].createdAt, // Preserve creation date
        updatedAt: new Date().toISOString(),
      };

      // Save to storage
      await this.saveCollection(collection);

      // Clear cache for this item
      this.cache.delete(`${collection}:${id}`);

      // Emit event
      this.eventBus.emit(`dataStore:${collection}:updated`, {
        id,
        oldData,
        newData: items[index],
      });

      console.log(`DataStore: Updated ${collection}:`, id);
      return items[index];
    } catch (error) {
      console.error(`DataStore: Failed to update ${collection}:`, error);
      throw error;
    }
  }

  /**
   * Remove item
   */
  async remove(collection, id) {
    try {
      const items = this.get(collection);

      if (!Array.isArray(items)) {
        throw new Error(
          `Cannot remove from non-array collection: ${collection}`
        );
      }

      const index = items.findIndex((item) => item.id == id);

      if (index === -1) {
        throw new Error(`Item with id ${id} not found in ${collection}`);
      }

      const removedItem = items.splice(index, 1)[0];

      // Save to storage
      await this.saveCollection(collection);

      // Clear cache
      this.cache.delete(`${collection}:${id}`);

      // Emit event
      this.eventBus.emit(`dataStore:${collection}:removed`, {
        id,
        data: removedItem,
      });

      console.log(`DataStore: Removed from ${collection}:`, id);
      return removedItem;
    } catch (error) {
      console.error(`DataStore: Failed to remove from ${collection}:`, error);
      throw error;
    }
  }

  /**
   * Clear entire collection
   */
  async clear(collection) {
    try {
      const oldData = [...this.get(collection)];
      this.data[collection] = collection === "settings" ? {} : [];

      await this.saveCollection(collection);
      this.clearCache(collection);

      this.eventBus.emit(`dataStore:${collection}:cleared`, { oldData });

      console.log(`DataStore: Cleared ${collection}`);
    } catch (error) {
      console.error(`DataStore: Failed to clear ${collection}:`, error);
      throw error;
    }
  }

  /**
   * Backup all data
   */
  async backup() {
    try {
      const result = await window.electronAPI.data.backup();
      this.eventBus.emit("dataStore:backup:created", result);
      return result;
    } catch (error) {
      console.error("DataStore: Backup failed:", error);
      throw error;
    }
  }

  /**
   * Get data statistics
   */
  getStats() {
    const stats = {};

    for (const [collection, data] of Object.entries(this.data)) {
      if (Array.isArray(data)) {
        stats[collection] = {
          count: data.length,
          lastSync: this.lastSync.get(collection),
          recent: data.filter((item) => {
            const created = new Date(item.createdAt || 0);
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            return created > weekAgo;
          }).length,
        };
      } else {
        stats[collection] = {
          keys: Object.keys(data).length,
          lastSync: this.lastSync.get(collection),
        };
      }
    }

    stats.cacheSize = this.cache.size;
    stats.isInitialized = this.isInitialized;

    return stats;
  }

  /**
   * Settings helpers
   */
  getSetting(key, defaultValue = null) {
    return this.data.settings[key] ?? defaultValue;
  }

  async setSetting(key, value) {
    this.data.settings[key] = value;
    await this.saveCollection("settings");
    this.eventBus.emit("dataStore:setting:changed", { key, value });
  }

  /**
   * Clear cache for collection or specific item
   */
  clearCache(collection = null) {
    if (collection) {
      for (const key of this.cache.keys()) {
        if (key.startsWith(`${collection}:`)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Validate collection name
   */
  validateCollection(collection) {
    if (!this.data.hasOwnProperty(collection)) {
      throw new Error(`Invalid collection: ${collection}`);
    }
  }

  /**
   * Export data for backup/transfer
   */
  export(collections = null) {
    const collectionsToExport = collections || Object.keys(this.data);
    const exportData = {
      version: "1.0",
      exported: new Date().toISOString(),
      data: {},
    };

    for (const collection of collectionsToExport) {
      if (this.data[collection]) {
        exportData.data[collection] = this.data[collection];
      }
    }

    return exportData;
  }

  /**
   * Import data from backup/transfer
   */
  async import(importData, options = {}) {
    const { merge = false, collections = null } = options;

    try {
      const collectionsToImport =
        collections || Object.keys(importData.data || {});

      for (const collection of collectionsToImport) {
        if (importData.data[collection]) {
          if (
            merge &&
            Array.isArray(this.data[collection]) &&
            Array.isArray(importData.data[collection])
          ) {
            // Merge arrays, avoiding duplicates by ID
            const existingIds = new Set(
              this.data[collection].map((item) => item.id)
            );
            const newItems = importData.data[collection].filter(
              (item) => !existingIds.has(item.id)
            );
            this.data[collection].push(...newItems);
          } else {
            // Replace collection
            this.data[collection] = importData.data[collection];
          }

          await this.saveCollection(collection);
        }
      }

      this.clearCache();
      this.eventBus.emit("dataStore:imported", {
        collections: collectionsToImport,
      });

      console.log("DataStore: Import completed");
    } catch (error) {
      console.error("DataStore: Import failed:", error);
      throw error;
    }
  }
}

// Create singleton instance
const dataStore = new DataStore();

export default dataStore;
