-- Insert sample user for testing
INSERT INTO users (id, email, profile)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'test@example.com', '{"name": "テストユーザー"}')
ON CONFLICT (email) DO NOTHING;

-- Insert sample vehicle
INSERT INTO vehicles (user_id, name, fuel_type, efficiency_kml, notes)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'トヨタ プリウス', 'hybrid', 25.00, 'ハイブリッド車')
ON CONFLICT DO NOTHING;

-- Insert default settings for sample user
INSERT INTO settings (user_id, fuel_price, toll_coeffs_json, rounding_mode)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 170.00, '{"base": 150, "per_km": 24.6}', 'round')
ON CONFLICT (user_id) DO NOTHING;
