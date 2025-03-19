export interface Device {
  id: string;
  name: string;
  type: string;
  phone_number: string;
  access_mode: 'authorized' | 'all';
  password: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  device_id: string;
  name: string | null;
  phone_number: string;
  serial_number: string;
  valid_from: string;
  valid_until: string | null;
  created_at: string;
  updated_at: string;
}

export interface Log {
  id: string;
  device_id: string;
  command: string;
  description: string;
  created_at: string;
  devices?: {
    name: string;
  };
}