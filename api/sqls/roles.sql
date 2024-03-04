-- Start of SQL file

-- Assuming `roles` table has been created and has the correct structure
-- to support the following columns:
-- id, name, isAdmin, isProtected, translations

-- Inserting roles
INSERT INTO `roles` (`name`, `isAdmin`, `isProtected`, `translations`) VALUES
('系统管理员', TRUE, TRUE, '{"en": "Administrator", "ja": "システム管理者"}'),
('仓管员', FALSE, TRUE, '{"en": "Warehouse Keeper", "ja": "倉庫管理者"}'),
('质检员', FALSE, TRUE, '{"en": "Quality Inspector", "ja": "品質検査員"}'),
('生产员', FALSE, TRUE, '{"en": "Production Worker", "ja": "生産作業員"}'),
('巡检员', FALSE, TRUE, '{"en": "Patrol Inspector", "ja": "巡回検査官"}');

-- End of SQL file

-- Start of SQL file

-- Assuming that the structure of the tables is as follows:
-- permissions(id, pattern, ...)
-- roles(id, isAdmin, ...)
-- role_permissions(role_id, permission_id)

-- First, retrieve the ID of the wildcard permission into a variable
SELECT @wildcardPermissionId := id FROM permissions WHERE pattern = '*:*:*';

-- Insert the wildcard permission for each admin role if not already present
-- The SELECT will not return any rows if @wildcardPermissionId is NULL
INSERT IGNORE INTO rolepermissions (RoleId, PermissionId, `createdAt`, `updatedAt`)
SELECT r.id, @wildcardPermissionId, NOW(), NOW() FROM roles r WHERE r.isAdmin = TRUE AND @wildcardPermissionId IS NOT NULL;

-- End of SQL file
