-- Initial admin password (scrypt, N=32768 r=8 p=1). Change it from /admin → 高级.
INSERT INTO "GameSetting" ("key", "value", "updatedAt")
VALUES (
  'adminPassword',
  '{"salt":"20507dfb97702c4fe0f9838316f05cde","hash":"5e3f2b99424ab9af4bdea7e726982304362514c141d8f0f87931fad2c3b95f0f"}',
  CURRENT_TIMESTAMP
)
ON CONFLICT ("key") DO NOTHING;
