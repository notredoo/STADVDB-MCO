INSERT INTO game_conformance_map (raw_title, raw_developer, raw_source, steam_appid) VALUES
-- 1. Dota 2 (AppID: 570)
('Dota 2', 'Valve', 'esports', 570),
('DOTA-2', 'Valve', 'rawg', 570),
('570', 'Valve', 'steamspy', 570);

INSERT INTO game_conformance_map (raw_title, raw_developer, raw_source, steam_appid) VALUES
-- 2. Counter-Strike 2 / CS:GO (AppID: 730) - **CORRECTED STEAM APPID**
('Counter-Strike: GO', 'Valve', 'esports', 730),
('CS: GO', 'Valve', 'rawg', 730),
('Counter-Strike Global Offensive', 'Valve', 'sales_csv', 730),
('730', 'Valve', 'steamspy', 730);

INSERT INTO game_conformance_map (raw_title, raw_developer, raw_source, steam_appid) VALUES
-- 3. PUBG: BATTLEGROUNDS (AppID: 578080)
('PUBG', 'PUBG Studios', 'esports', 578080),
('PlayerUnknown''s Battlegrounds', 'PUBG Studios', 'sales_csv', 578080),
('578080', 'PUBG Studios', 'steamspy', 578080);

INSERT INTO game_conformance_map (raw_title, raw_developer, raw_source, steam_appid) VALUES
-- 4. Final Fantasy XIV Online (AppID: 39210)
('Final Fantasy XIV Online', 'Square Enix', 'rawg', 39210),
('FINAL FANTASY XIV: A Realm Reborn', 'Square Enix', 'steamspy', 39210),
('FFXIV: A Realm Reborn', 'Square Enix', 'sales_csv', 39210);

INSERT INTO game_conformance_map (raw_title, raw_developer, raw_source, steam_appid) VALUES
-- 5. League of Legends (Not on Steam, using custom ID 999001)
('League of Legends', 'Riot Games', 'esports', 999001), -- Use a high custom ID for non-Steam games
('League of Legends', 'Riot Games', 'rawg', 999001),
('LoL', 'Riot Games', 'rawg', 999001);

INSERT INTO game_conformance_map (raw_title, raw_developer, raw_source, steam_appid) VALUES
-- 6. Grand Theft Auto V (AppID: 271590)
('Grand Theft Auto V', 'Rockstar Games', 'sales_csv', 271590),
('GTA V', 'Rockstar Games', 'rawg', 271590),
('271590', 'Rockstar Games', 'steamspy', 271590);

INSERT INTO game_conformance_map (raw_title, raw_developer, raw_source, steam_appid) VALUES
-- 7. Apex Legends (AppID: 1172470)
('Apex Legends', 'Respawn Entertainment', 'esports', 1172470),
('Apex', 'Respawn Entertainment', 'rawg', 1172470);

INSERT INTO game_conformance_map (raw_title, raw_developer, raw_source, steam_appid) VALUES
-- 8. The Witcher 3: Wild Hunt (AppID: 292030)
('The Witcher 3', 'CD Projekt Red', 'rawg', 292030),
('Witcher 3: Wild Hunt', 'CD Projekt Red', 'sales_csv', 292030);

INSERT INTO game_conformance_map (raw_title, raw_developer, raw_source, steam_appid) VALUES
-- 9. Warframe (AppID: 230410)
('Warframe', 'Digital Extremes', 'esports', 230410),
('230410', 'Digital Extremes', 'steamspy', 230410);

INSERT INTO game_conformance_map (raw_title, raw_developer, raw_source, steam_appid) VALUES
-- 10. Terraria (AppID: 105600)
('Terraria', 'Re-Logic', 'sales_csv', 105600),
('Terraria (Game)', 'rawg', 105600);