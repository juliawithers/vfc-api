INSERT INTO users (auth, username, passw, date_created)
VALUES
('b0715efe-ffaf-11e8-8eb2-f2801f1b9fd1','scottM91','mCauLl20!', now() - '21 days'::INTERVAL),
('b07161a6-ffaf-11e8-8eb2-f2801f1b9fd1','stiles4Life','dylanObrien!', now() - '21 days'::INTERVAL),
('b07162f0-ffaf-11e8-8eb2-f2801f1b9fd1','lydiaMartin','banshee101!', now() - '21 days'::INTERVAL)
;

INSERT INTO characters (auth, username, user_id, char_name, strength, intelligence, charisma, agility, current_level, current_points, wins, losses, attrPoints)
VALUES
  ('b0715efe-ffaf-11e8-8eb2-f2801f1b9fd1','scottM91', 1,'teenwolfalpha', 5, 1, 2, 1, 1, 0, 1, 0, 0),
  ('b07161a6-ffaf-11e8-8eb2-f2801f1b9fd1', 'stiles4Life', 2, 'alphasbff', 3, 3, 3, 1, 1, 0, 1, 2, 0),
  ('b07162f0-ffaf-11e8-8eb2-f2801f1b9fd1', 'lydiaMartin', 3, 'banshee', 2, 5, 2, 1, 1, 0, 0, 1, 0)
;
    
INSERT INTO matches (char_1_id, char_2_id, winner, loser, points)
VALUES
  (3, 2, 'banshee', 'stiles4Life', 2),
  (1, 2, 'teenwolfalpha', 'stiles4Life', 2),
  (2, 3, 'alphasbff', 'lydiaMartin', 2)
;



    