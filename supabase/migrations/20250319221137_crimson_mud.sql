/*
  # Initial Schema Setup for Relay Control App

  1. New Tables
    - `devices`
      - Stores relay device information
      - Includes device name, type, phone number, and settings
    - `authorized_users`
      - Stores authorized users for devices
      - Includes user details and validity period
    - `logs`
      - Stores command history and device interactions
      - Includes command details and timestamps

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create devices table
CREATE TABLE IF NOT EXISTS devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  name text NOT NULL,
  type text NOT NULL,
  phone_number text NOT NULL,
  access_mode text NOT NULL DEFAULT 'authorized',
  password text NOT NULL DEFAULT '1234',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create authorized_users table
CREATE TABLE IF NOT EXISTS authorized_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id uuid REFERENCES devices(id) ON DELETE CASCADE,
  name text,
  phone_number text NOT NULL,
  serial_number text NOT NULL,
  valid_from timestamptz DEFAULT now(),
  valid_until timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create logs table
CREATE TABLE IF NOT EXISTS logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id uuid REFERENCES devices(id) ON DELETE CASCADE,
  command text NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE authorized_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own devices"
  ON devices
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage authorized users for their devices"
  ON authorized_users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM devices
      WHERE devices.id = authorized_users.device_id
      AND devices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view logs for their devices"
  ON logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM devices
      WHERE devices.id = logs.device_id
      AND devices.user_id = auth.uid()
    )
  );