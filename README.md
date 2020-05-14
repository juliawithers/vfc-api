# VFC!


## Set up

1. Clone this repository to your local machine `git clone BOILERPLATE-URL NEW-PROJECTS-NAME`
2. `cd` into the cloned repository
3. Make a fresh start of the git history for this project with `rm -rf .git && git init`
4. Install the node dependencies `npm install`
5. Move the example Environment file to `.env` that will be ignored by git and read by the express server `mv example.env .env`
6. Edit the contents of the `package.json` to use NEW-PROJECT-NAME instead of `"name": "express-boilerplate",`
7. To create tables:
    psql -U postgres -d vfc -f ./migrations/001.create_tables.sql 
8. To seed tables:
    psql -U postgres -d vfc -f ./seeds/seed.vfc.sql
9. Migrations: 
    npm run migrate (version)  OR  npm run migrate:test(version)

## Scripts
Test `mocha --require test/setup.js --watch`
Start the application `npm start`
Start nodemon for the application `npm run dev`
Run the tests `npm test`
migrate `postgrator --config postgrator-config.js`
migrate:test `env NODE_ENV=test npm run migrate`

## Deploying

When your new project is ready for deployment, add a new Heroku application with `heroku create`. This will make a new git remote called "heroku" and you can then `npm run deploy` which will push to this remote's master branch.


##  SCHEMAS:
#   /login 
.post: 
query: 
{
    "username": username, 
    "password": passw
}
returns: {
    "login": true,
    "user": [
        {
            "id": 3,
            "auth": "b07162f0-ffaf-11e8-8eb2-f2801f1b9fd1",
            "username": "lydiaMartin",
            "passw": "banshee101!",
            "date_created": "2020-04-06T14:24:13.492Z"
        }
    ]
}

#   /users
.get:
query params:
{
    "login": true,
    "userId": users unique id
}
returns:
{
    "users": [{
        "auth": user auth,
        "username": "",
        "passw": "",
    },...  ]
}

.post: 
body:  
{
    "auth": user auth,
    "username": "",
    "passw": "",
}
returns: 
{
    "id": user.id
}

.delete:
body: 
{
    "user_id": user.id
}
returns:
{
    "userId": user.id
}

#   /characters
.get:
query params: 
{
    "login": true,
    "userId": user.id
}
returns: 
{
    "characters": [{
        "id": character id,
        "auth": "",
        "username": "",
        "user_id": ,
        "char_name": "",
        "strength": ,
        "intelligence": ,
        "charisma": ,
        "agility": ,
        "current_level": ,
        "current_points": ,
        "wins": ,
        "losses": ,
        "attrPoints": 
    }, ...]
}

.post:
body: 
{
    "auth": "",
    "username": "",
    "user_id": ,
    "char_name": "",
    "strength": ,
    "intelligence": ,
    "charisma": ,
    "agility": ,
    "current_level": ,
    "current_points": ,
    "wins": ,
    "losses": ,
    "attrPoints": 
}
returns: 
{
    "character": {
        "id": character id
        "auth": "",
        "username": "",
        "user_id": ,
        "char_name": "",
        "strength": ,
        "intelligence": ,
        "charisma": ,
        "agility": ,
        "current_level": ,
        "current_points": ,
        "wins": ,
        "losses": ,
        "attrPoints": 
    }
}
TEST CHARACTER OBJECT:

{
"auth": "0810bd3e-6112-4c27-a63f-c533e885495c",
"username": "testcharacter",
"user_id": 3,
"char_name": "testy",
"strength": 5,
"intelligence": 2,
"charisma": 2,
"agility": 1,
"current_level": 0,
"current_points": 0,
"wins": 1,
"losses": 0,
"attr_points": 0
}

.delete:
body:
{
    "id": id from character table
}
returns:
success status or error

#   /matches
.get:
request does not need any info
returns: 
{
    "matches":[{
        "char_1_id": current user id,
        "char_2_id": opponent id,
        "winner": ,
        "loser": ,
        "points": 
    },...]
}

.post:
body: 
{
    "char_1_id": current user id,
    "char_2_id": opponent id,
    "winner": ,
    "loser": ,
    "points": 
}
returns: 
{
    "match": {
        "id": match id
        "char_1_id": current user id,
        "char_2_id": opponent id,
        "winner": ,
        "loser": ,
        "points": 
    }
}

# /characters/:id
.get:
query params: 
{
    "login": true,
    "userId": users id
}
returns:
{
    "character": {
        "id": character id
        "auth": "",
        "username": "",
        "user_id": ,
        "char_name": "",
        "strength": ,
        "intelligence": ,
        "charisma": ,
        "agility": ,
        "current_level": ,
        "current_points": ,
        "wins": ,
        "losses": ,
        "attrPoints": 
    }
}