-- Inserting barcode status dictionary
INSERT INTO dictionaries (`key`, `value`, `name`, `isProtected`, `translations`)
VALUES
  ('barcode_status', 0, '默认', true, '{"en": "Default", "ja": "デフォルト"}'),
  ('barcode_status', 1, '在库', true, '{"en": "In stock", "ja": "在庫あり"}'),
  ('barcode_status', 2, '在途', true, '{"en": "In transit", "ja": "途中で"}'),
  ('barcode_status', 3, '已报废', true, '{"en": "Scrapped", "ja": "廃棄された"}'),
  ('barcode_status', 4, '已报失', true, '{"en": "Lost", "ja": "失った"}');

-- Inserting position stackable dictionary
INSERT INTO dictionaries (`key`, `value`, `name`, `isProtected`, `translations`)
VALUES
  ('position_stackable', 0, '不可堆叠', true, '{"en": "Not stackable", "ja": "スタッキング不可"}'),
  ('position_stackable', 1, '可堆叠', true, '{"en": "Stackable", "ja": "スタッキング可能"}');

-- Inserting status dictionary
INSERT INTO dictionaries (`key`, `value`, `name`, `isProtected`, `translations`)
VALUES
  ('status', 0, '无效', true, '{"en": "Invalid", "ja": "無効"}'),
  ('status', 1, '有效', true, '{"en": "Valid", "ja": "有効"}');

-- Inserting sop dictionary
INSERT INTO dictionaries (`key`, `value`, `name`, `isProtected`, `translations`)
VALUES
  ('sops', 0, '角色管理', true, '{"en": "Roles Management", "ja": "ロール管理"}'),
  ('sops', 1, '用户管理', true, '{"en": "Users Management", "ja": "ユーザー管理"}'),
  ('sops', 2, '条码生成', true, '{"en": "Barcode Create", "ja": "バーコード生成"}'),
  ('sops', 3, '条码管理', true, '{"en": "Barcode Management", "ja": "バーコード管理"}'),
  ('sops', 4, '库位码生成', true, '{"en": "Position Create", "ja": "ポジションコード生成"}'),
  ('sops', 5, '库位码管理', true, '{"en": "Position Management", "ja": "ポジションコード管理"}');

-- Inserting sensor types dictionary
INSERT INTO dictionaries (`key`, `value`, `name`, `isProtected`, `translations`)
VALUES
  ('sensor_type', 0, '温湿度传感器', true, '{"en": "Temperature & Humidity Sensor", "ja": "温湿度センサー"}');

-- Inserting other miscellaneous dictionary
INSERT INTO dictionaries (`key`, `value`, `name`, `isProtected`, `translations`)
VALUES
  ('online', 0, '离线', true, '{"en": "Offline", "ja": "オフライン"}'),
  ('online', 1, '在线', true, '{"en": "Online", "ja": "オンライン"}'),
  ('yes_or_no', 0, '否', true, '{"en": "No", "ja": "いいえ"}'),
  ('yes_or_no', 1, '是', true, '{"en": "Yes", "ja": "はい"}');
