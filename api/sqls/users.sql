-- Start of SQL file

-- Assuming `users` table has been created and has the correct structure
-- to support the following columns:
-- id, username, password, name, isProtected, translations, createdAt, updatedAt

-- Inserting users with placeholders for hashed passwords
-- Replace 'hashed_password_for_admin' and 'hashed_password_for_keyneko'
-- with the actual hashed passwords generated by bcrypt in your application

INSERT INTO `users` (`username`, `password`, `name`, `isProtected`, `translations`, `createdAt`, `updatedAt`) VALUES
('admin', '$2b$12$.VqHtrbELtHyK.Eamn2wJ.JVsv817/y4PLaShTcpWwAa3ESGa/f5K', '超级管理员', TRUE, '{"en": "Super Admin", "ja": "スーパー管理者"}', NOW(), NOW()),
('keyneko', '$2b$12$.VqHtrbELtHyK.Eamn2wJ.JVsv817/y4PLaShTcpWwAa3ESGa/f5K', '搬运工', TRUE, '{"en": "Brick Carrier", "ja": "ボトムポーター"}', NOW(), NOW());

-- End of SQL file


-- Start of SQL file

-- Assuming that the structure of the tables is as follows:
-- roles(id, ..., isAdmin)
-- users(id, username, ...)
-- user_roles(user_id, role_id)

-- First, retrieve the ID of the admin role
SELECT @adminRoleId := id FROM roles WHERE isAdmin = TRUE;

-- Then, find the user ID for the username 'admin'
SELECT @userId := id FROM users WHERE username = 'admin';

-- Now, insert the relation into the user_roles table
-- This assumes that the combination of user_id and role_id is unique
-- and that such a constraint is enforced in the user_roles table
INSERT INTO userroles (UserId, RoleId, `createdAt`, `updatedAt`)
VALUES (@userId, @adminRoleId, NOW(), NOW())
ON DUPLICATE KEY UPDATE RoleId = @adminRoleId;

-- End of SQL file
