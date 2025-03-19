import * as SQLite from 'expo-sqlite';
import { v4 as uuidv4 } from 'uuid';
import { Device, User, Log } from '@/types';

const db = SQLite.openDatabase('relay_control.db');

export const initDatabase = () => {
  return new Promise<void>((resolve, reject) => {
    db.transaction(tx => {
      // Create devices table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS devices (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          phone_number TEXT NOT NULL,
          access_mode TEXT NOT NULL DEFAULT 'authorized',
          password TEXT NOT NULL DEFAULT '1234',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );`
      );

      // Create authorized_users table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS authorized_users (
          id TEXT PRIMARY KEY,
          device_id TEXT NOT NULL,
          name TEXT,
          phone_number TEXT NOT NULL,
          serial_number TEXT NOT NULL,
          valid_from TEXT NOT NULL,
          valid_until TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY (device_id) REFERENCES devices (id) ON DELETE CASCADE
        );`
      );

      // Create logs table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS logs (
          id TEXT PRIMARY KEY,
          device_id TEXT NOT NULL,
          command TEXT NOT NULL,
          description TEXT NOT NULL,
          created_at TEXT NOT NULL,
          FOREIGN KEY (device_id) REFERENCES devices (id) ON DELETE CASCADE
        );`
      );
    }, 
    (error) => {
      console.error('Error creating tables:', error);
      reject(error);
    },
    () => {
      resolve();
    });
  });
};

// Device operations
export const getDevices = (): Promise<Device[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM devices ORDER BY created_at DESC',
        [],
        (_, { rows: { _array } }) => resolve(_array),
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const addDevice = (device: Omit<Device, 'id' | 'created_at' | 'updated_at'>): Promise<Device> => {
  const now = new Date().toISOString();
  const id = uuidv4();
  
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO devices (id, name, type, phone_number, access_mode, password, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, device.name, device.type, device.phone_number, device.access_mode, device.password, now, now],
        () => {
          resolve({ ...device, id, created_at: now, updated_at: now });
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

// User operations
export const getDeviceUsers = (deviceId: string): Promise<User[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM authorized_users WHERE device_id = ? ORDER BY created_at DESC',
        [deviceId],
        (_, { rows: { _array } }) => resolve(_array),
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const addUser = (user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> => {
  const now = new Date().toISOString();
  const id = uuidv4();

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO authorized_users (id, device_id, name, phone_number, serial_number, valid_from, valid_until, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, user.device_id, user.name, user.phone_number, user.serial_number, user.valid_from, user.valid_until, now, now],
        () => {
          resolve({ ...user, id, created_at: now, updated_at: now });
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

// Log operations
export const addLog = (log: Omit<Log, 'id' | 'created_at'>): Promise<Log> => {
  const now = new Date().toISOString();
  const id = uuidv4();

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO logs (id, device_id, command, description, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [id, log.device_id, log.command, log.description, now],
        () => {
          resolve({ ...log, id, created_at: now });
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const getDeviceLogs = (deviceId: string): Promise<Log[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT logs.*, devices.name as device_name 
         FROM logs 
         JOIN devices ON logs.device_id = devices.id 
         WHERE device_id = ? 
         ORDER BY created_at DESC`,
        [deviceId],
        (_, { rows: { _array } }) => resolve(_array),
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};