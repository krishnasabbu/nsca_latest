/*
  # Create SMS Messages Table

  1. New Tables
    - `sms_messages`
      - `id` (uuid, primary key) - Unique identifier for each SMS message
      - `sms_date` (timestamptz) - Date and time of the SMS
      - `sender_address` (text) - Phone number or address of the sender
      - `transaction_type` (text) - Type of transaction (credit/debit)
      - `amount` (decimal) - Transaction amount
      - `upi_id` (text) - UPI ID associated with the transaction
      - `transaction_id` (text) - Unique transaction identifier
      - `party_name` (text) - Name of the party in the transaction
      - `full_message` (text) - Complete SMS message content
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record last update timestamp

  2. Security
    - Enable RLS on `sms_messages` table
    - Add policy for authenticated admins to read all SMS messages
    - Add policy for authenticated admins to insert SMS messages
    - Add policy for authenticated admins to update SMS messages
    - Add policy for authenticated admins to delete SMS messages

  3. Indexes
    - Index on sms_date for faster date-based queries
    - Index on transaction_type for filtering
    - Index on sender_address for filtering
*/

CREATE TABLE IF NOT EXISTS sms_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sms_date timestamptz,
  sender_address text,
  transaction_type text,
  amount decimal(10, 2),
  upi_id text,
  transaction_id text,
  party_name text,
  full_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE sms_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all SMS messages"
  ON sms_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert SMS messages"
  ON sms_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update SMS messages"
  ON sms_messages
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete SMS messages"
  ON sms_messages
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_sms_messages_date ON sms_messages(sms_date DESC);
CREATE INDEX IF NOT EXISTS idx_sms_messages_type ON sms_messages(transaction_type);
CREATE INDEX IF NOT EXISTS idx_sms_messages_sender ON sms_messages(sender_address);
