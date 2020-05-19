INSERT INTO users (auth, username, passw, date_created)
VALUES
('b0715efe-ffaf-11e8-8eb2-f2801f1b9fd1','scottM91','mCauLl20!', now() - '21 days'::INTERVAL),
('b07161a6-ffaf-11e8-8eb2-f2801f1b9fd2','stiles4Life','dylanObrien!', now() - '21 days'::INTERVAL),
('b07162f0-ffaf-11e8-8eb2-f2801f1b9fd3','lydiaMartin','banshee101!', now() - '21 days'::INTERVAL),
('b07162f0-ffaf-11e8-8eb2-f2801f1b9fd4','user4','password4!', now() - '21 days'::INTERVAL),
('b07162f0-ffaf-11e8-8eb2-f2801f1b9fd5','user5','password5!', now() - '21 days'::INTERVAL),
('b07162f0-ffaf-11e8-8eb2-f2801f1b9fd6','user6','password6!', now() - '21 days'::INTERVAL),
('b07162f0-ffaf-11e8-8eb2-f2801f1b9fd7','user7','password7!', now() - '21 days'::INTERVAL),
('b07162f0-ffaf-11e8-8eb2-f2801f1b9fd8','user8','password8!', now() - '21 days'::INTERVAL),
('b07162f0-ffaf-11e8-8eb2-f2801f1b9fd9','user9','password9!', now() - '21 days'::INTERVAL),
('b07162f0-ffaf-11e8-8eb2-f2801f1b9fd10','user10','password10!', now() - '21 days'::INTERVAL)
;

INSERT INTO characters (auth, username, user_id, char_name, strength, intelligence, charisma, agility, current_level, current_points, wins, losses, attrPoints)
VALUES
  ('b0715efe-ffaf-11e8-8eb2-f2801f1b9fd1','scottM91', 1,'teenwolfalpha', 5, 1, 2, 1, 0, 0, 1, 0, 0),
  ('b07161a6-ffaf-11e8-8eb2-f2801f1b9fd2', 'stiles4Life', 2, 'alphasbff', 3, 3, 3, 1, 0, 0, 1, 2, 0),
  ('b07162f0-ffaf-11e8-8eb2-f2801f1b9fd3', 'lydiaMartin', 3, 'banshee', 2, 5, 2, 1, 0, 0, 0, 1, 0),
  ('b07162f0-ffaf-11e8-8eb2-f2801f1b9fd4', 'user4', 4, 'user4char', 2, 5, 2, 1, 0, 0, 0, 1, 0),
  ('b07162f0-ffaf-11e8-8eb2-f2801f1b9fd5', 'user5', 5, 'user5char', 2, 5, 2, 1, 0, 0, 0, 1, 0),
  ('b07162f0-ffaf-11e8-8eb2-f2801f1b9fd6', 'user6', 6, 'user6char', 2, 5, 2, 1, 0, 0, 0, 1, 0),
  ('b07162f0-ffaf-11e8-8eb2-f2801f1b9fd7', 'user7', 7, 'user7char', 2, 5, 2, 1, 0, 0, 0, 1, 0),
  ('b07162f0-ffaf-11e8-8eb2-f2801f1b9fd8', 'user8', 8, 'user8char', 2, 5, 2, 1, 0, 0, 0, 1, 0),
  ('b07162f0-ffaf-11e8-8eb2-f2801f1b9fd9', 'user9', 9, 'user9char', 2, 5, 2, 1, 0, 0, 0, 1, 0),
  ('b07162f0-ffaf-11e8-8eb2-f2801f1b9fd10', 'user10', 10, 'user10char', 2, 5, 2, 1, 0, 0, 0, 1, 0)
;
    
INSERT INTO matches (char_1_id, char_2_id, winner, loser, points)
VALUES
  (3, 2, 'banshee', 'stiles4Life', 2),
  (1, 2, 'teenwolfalpha', 'stiles4Life', 2),
  (2, 3, 'alphasbff', 'lydiaMartin', 2),
  (4, 5, 'user4', 'user5', 2),
  (6, 7, 'user6', 'user7', 2),
  (2, 3, 'alphasbff', 'lydiaMartin', 2),
  (8, 5, 'user8', 'user5', 2),
  (10, 3, 'user10', 'lydiaMartin', 2),
  (9, 5, 'user9', 'user5', 2),
  (2, 3, 'alphasbff', 'lydiaMartin', 2)     
;



    