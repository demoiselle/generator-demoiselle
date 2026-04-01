-- Default roles for RBAC
INSERT INTO app_role (id, name) VALUES (1, 'ADMIN');
INSERT INTO app_role (id, name) VALUES (2, 'USER');

-- Default users
-- Password: '123456' hashed with BCrypt
INSERT INTO app_user (ID, EMAIL, DESCRIPTION, PASS, EMAIL_VERIFIED) VALUES ('b83810af-7ba9-4aea-8bb6-f4992a72c5fb', 'admin@demoiselle.org', 'Admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', true);
INSERT INTO app_user (ID, EMAIL, DESCRIPTION, PASS, EMAIL_VERIFIED) VALUES ('dd10b422-ecc4-4aa3-879a-cdc25ca4eff8', 'gerente_1@demoiselle.org', 'Gerente1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', true);
INSERT INTO app_user (ID, EMAIL, DESCRIPTION, PASS, EMAIL_VERIFIED) VALUES ('538b7006-8a3b-4705-8e41-c58930bf3bc9', 'usuario_1@demoiselle.org', 'Usuário1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', true);

-- Assign roles to users
INSERT INTO user_role (user_id, role_id) VALUES ('b83810af-7ba9-4aea-8bb6-f4992a72c5fb', 1);
INSERT INTO user_role (user_id, role_id) VALUES ('b83810af-7ba9-4aea-8bb6-f4992a72c5fb', 2);
INSERT INTO user_role (user_id, role_id) VALUES ('dd10b422-ecc4-4aa3-879a-cdc25ca4eff8', 2);
INSERT INTO user_role (user_id, role_id) VALUES ('538b7006-8a3b-4705-8e41-c58930bf3bc9', 2);
