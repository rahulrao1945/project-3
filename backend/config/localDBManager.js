import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const dbPath = path.resolve('local_db.json');

const readDB = () => {
  try {
    const data = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return { users: [], products: [], messages: [], reviews: [] };
  }
};

const writeDB = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
};

export class LocalModel {
  constructor(collection) {
    this.collection = collection;
  }

  async find(filter = {}) {
    const db = readDB();
    let items = db[this.collection] || [];
    
    // Simple filter matching
    return items.filter(item => {
      for (let key in filter) {
        if (filter[key] !== undefined) {
          // Handling basic object/array matches and arrays like $in or raw equality
          if (filter[key] && typeof filter[key] === 'object' && filter[key].$in) {
            if (!filter[key].$in.includes(item[key])) return false;
          } else if (item[key] !== filter[key]) {
            return false;
          }
        }
      }
      return true;
    });
  }

  async findOne(filter = {}) {
    const items = await this.find(filter);
    return items.length > 0 ? items[0] : null;
  }

  async findById(id) {
    const db = readDB();
    const items = db[this.collection] || [];
    return items.find(item => item._id === id || item.id === id) || null;
  }

  async create(data) {
    const db = readDB();
    const newItem = {
      _id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    };
    db[this.collection] = db[this.collection] || [];
    db[this.collection].push(newItem);
    writeDB(db);
    return newItem;
  }

  async findByIdAndUpdate(id, updateData, options = { new: true }) {
    const db = readDB();
    const items = db[this.collection] || [];
    const index = items.findIndex(item => item._id === id || item.id === id);
    
    if (index === -1) return null;
    
    // If updateData contains $push or special operator, resolve it (like wishlist pushing)
    let currentItem = items[index];
    if (updateData.$push) {
      for (let key in updateData.$push) {
        currentItem[key] = currentItem[key] || [];
        if (!currentItem[key].includes(updateData.$push[key])) {
          currentItem[key].push(updateData.$push[key]);
        }
      }
    }
    if (updateData.$pull) {
      for (let key in updateData.$pull) {
        currentItem[key] = currentItem[key] || [];
        currentItem[key] = currentItem[key].filter(v => v !== updateData.$pull[key]);
      }
    }
    
    // Regular updates
    const cleanedUpdate = { ...updateData };
    delete cleanedUpdate.$push;
    delete cleanedUpdate.$pull;
    
    const updatedItem = {
      ...currentItem,
      ...cleanedUpdate,
      updatedAt: new Date().toISOString()
    };
    
    items[index] = updatedItem;
    db[this.collection] = items;
    writeDB(db);
    return updatedItem;
  }

  async findByIdAndDelete(id) {
    const db = readDB();
    const items = db[this.collection] || [];
    const itemToDelete = items.find(item => item._id === id || item.id === id);
    
    if (!itemToDelete) return null;
    
    db[this.collection] = items.filter(item => item._id !== id && item.id !== id);
    writeDB(db);
    return itemToDelete;
  }
}
