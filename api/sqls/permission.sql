-- Start of SQL file

-- Assuming `permissions` table has been created and has the correct structure
-- to support the following columns:
-- id, name, description, pattern, isProtected, translations

-- Inserting permissions
INSERT INTO `permissions` (`name`, `description`, `pattern`, `isProtected`, `translations`, `createdAt`, `updatedAt`) VALUES
('管理员权限', '通配权限，这是最大权限了', '*:*:*', TRUE, '{"en": "Administrator Permissions", "ja": "管理者権限"}', NOW(), NOW()),
('角色管理', NULL, 'roles:*:*', TRUE, '{"en": "Roles Management", "ja": "ロール管理"}', NOW(), NOW()),
('用户管理', NULL, 'users:*:*', TRUE, '{"en": "Users Management", "ja": "ユーザー管理"}', NOW(), NOW()),
('字典词条', NULL, 'dictionaries:*:*', TRUE, '{"en": "Dictionaries", "ja": "辞書エントリ"}', NOW(), NOW()),
('条码', NULL, 'barcodes:*:*', TRUE, '{"en": "Barcodes", "ja": "バーコード"}', NOW(), NOW()),
('条码查询', NULL, 'barcodes:query:*', TRUE, '{"en": "Barcodes Query", "ja": "バーコードクエリー"}', NOW(), NOW()),
('条码管理', NULL, 'barcodes:management:*', TRUE, '{"en": "Barcodes Management", "ja": "バーコード管理"}', NOW(), NOW()),
('条码生成', NULL, 'barcodes:management:create', TRUE, '{"en": "Barcode Create", "ja": "バーコード生成"}', NOW(), NOW()),
('条码删除', NULL, 'barcodes:management:delete', TRUE, '{"en": "Barcode Delete", "ja": "バーコード削除"}', NOW(), NOW()),
('条码更新', NULL, 'barcodes:management:update', TRUE, '{"en": "Barcode Update", "ja": "バーコード更新"}', NOW(), NOW()),
('库位码', NULL, 'positions:*:*', TRUE, '{"en": "Positions", "ja": "ポジションコード"}', NOW(), NOW()),
('库位码查询', NULL, 'positions:query:*', TRUE, '{"en": "Positions Query", "ja": "ポジションコードクエリー"}', NOW(), NOW()),
('库位码管理', NULL, 'positions:management:*', TRUE, '{"en": "Positions Management", "ja": "ポジションコード管理"}', NOW(), NOW()),
('库位码生成', NULL, 'positions:management:create', TRUE, '{"en": "Position Create", "ja": "ポジションコード生成"}', NOW(), NOW()),
('库位码删除', NULL, 'positions:management:delete', TRUE, '{"en": "Position Delete", "ja": "ポジションコード削除"}', NOW(), NOW()),
('库位码更新', NULL, 'positions:management:update', TRUE, '{"en": "Position Update", "ja": "ポジションコード更新"}', NOW(), NOW()),
('传感器模块', NULL, 'sensors:*:*', TRUE, '{"en": "Sensors", "ja": "センサー"}', NOW(), NOW()),
('传感器生成', NULL, 'sensors:management:create', TRUE, '{"en": "Sensor Create", "ja": "センサー生成"}', NOW(), NOW()),
('传感器删除', NULL, 'sensors:management:delete', TRUE, '{"en": "Sensor Delete", "ja": "センサー削除"}', NOW(), NOW()),
('传感器更新', NULL, 'sensors:management:update', TRUE, '{"en": "Sensor Update", "ja": "センサー更新"}', NOW(), NOW()),
('传感器推送消息', NULL, 'sensors:management:publish', TRUE, '{"en": "Sensor Publish", "ja": "センサープッシュ"}', NOW(), NOW());

-- End of SQL file
