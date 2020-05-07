-- Create Users, Matches, Characters

CREATE TABLE users (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    auth TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    passw VARCHAR(100) NOT NULL,
    date_created TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE characters (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    auth TEXT NOT NULL,
    username TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    char_name TEXT UNIQUE NOT NULL,
    strength decimal(10,0),
    intelligence decimal(10,0),
    charisma decimal(10,0),
    agility decimal(10,0),
    current_level decimal(10,0),
    current_points decimal(10,0),
    wins decimal(10,0),
    losses decimal(10,0),
    attrPoints decimal (10,0)
);

CREATE TABLE matches (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    char_1_id INTEGER NOT NULL,
    char_2_id INTEGER NOT NULL,
    winner TEXT NOT NULL,
    loser TEXT NOT NULL,
    points decimal(10,0)
);