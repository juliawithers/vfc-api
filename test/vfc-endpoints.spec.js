const knex = require('knex')
const app = require('../src/app')
const { makeUsersArray } = require('./vfc.fixtures')
const { makeCharactersArray } = require('./vfc.fixtures')
const { makeMatchesArray } = require('./vfc.fixtures')

describe.only('VFC Endpoints', function() {
    let db

    before('make knex instance', () => {
      db = knex({
        client: 'pg',
        connection: process.env.TEST_DB_URL,
      })
      app.set('db', db)
    })
  
    after('disconnect from db', () => db.destroy())
    
    before('clean the matches table', () => db('matches').truncate())
    before('clean the characters table', () => db('characters').truncate())
    before('clean the users table', () => db('users').truncate())

    afterEach('cleanup', () => db('matches').truncate())   
    afterEach('cleanup', () => db('characters').truncate())
    afterEach('cleanup', () => db('users').truncate())  

    describe(`POST /login`, () => {
        context(`given username and password are provided`, () => {
            it(`responds with 200 and returns true login and user object`)
            it(`responds with 404 not found if user data doesn't exist`)
        })

        context(`given either username or password is not provided`, () =>{
            it(`responds with 400`)
        })
    })
    
    describe(`POST /users`, () => {
        context(`given data in the database`, () => {
            const testUsers = makeUsersArray
            beforeEach('insert users', () => {
                return db
                    .into('users')
                    .insert(testUsers)
            })
            

            it(`responds with 400 if username is not provided`, ()=>{
                const testUser = {
                    username: '',
                    passw: 'hello123!',
                    login: true
                }
                return supertest(app)
                    .post(testUser)
                    .expect(400,{
                        error: { 
                            message: `Username is required`}
                        })
            })
            it(`responds with 400 if password is not provided`,()=>{
                const testUser = {
                    username: 'username',
                    passw: '',
                    login: true
                }
                return supertest(app)
                    .post(testUser)
                    .expect(400,{
                        error: { 
                            message: `Password is required`}
                        })
            })
            it(`responds with 400 if username does not meet parameters`,()=>{
                const testUser = {
                    username: 'us',
                    passw: 'hello123!',
                    login: true
                }
                return supertest(app)
                    .post(testUser)
                    .expect(400,{
                        error: { 
                            message: `Username must be between 6 and 20 characters`}
                        })
            })
            it(`responds with 400 if password does not meet parameters`,()=>{
                const testUser = {
                    username: 'username',
                    passw: 'hello',
                    login: true
                }
                return supertest(app)
                    .post(testUser)
                    .expect(400,{
                        error: { 
                            message: 'Password must be contain at least one digit and one special character'}
                        })
            })

            it(`responds with 400 if username already exists`, ()=>{
                const testUsers = makeUsersArray
                const testUser = testUsers[0]
                return supertest(app)
                    .post(testUser)
                    .expect(400,{
                        error: { 
                            message: `username is already in use, pick another name`}
                        })
            })

            it(`responds with 201 when user is successfully created`,()=>{
                const testUser = {
                    username: 'username',
                    passw: 'hello123!',
                    login: true
                }
                return supertest(app)
                    .post(testUser)
                    .expect(201)
                    .expect(res=>{
                        expect(res.body.username).to.eql(testUser.username)
                        expect(res.body.passw).to.eql(testUser.passw)
                        
                    })
            })
        })
    })

    // might need to change endpoint to /users/:id
    describe(`DELETE /users`, () => {
        context(`given data in the database`, () => {
            const testUsers = makeUsersArray
            beforeEach('insert users', () => {
                return db
                    .into('users')
                    .insert(testUsers)
            })
        

            it(`responds with 204 and removes the user, characters, and matches from the database(using cascade)`,()=>{
                
                const testUser = testUsers[0]
                const expectedUsers = testUsers.filter(user => user.id === testUser.id)
                return supertest(app)
                    .delete(testUser)
                    .expect(204)
                    .expect(res => {
                        expect(res.body.user_id).to.eql(testUser.user_id)
                    })
                    .then(postRes => 
                        supertest(app)
                            .get(`/users`)
                            .expect(expectedUsers)    
                    )
            })

            it(`responds with 404 if the user does not exist`,()=>{
                const testUser = {
                    id: 123456677,
                    auth: 'madeupauth',
                    username: 'username',
                    passw: 'hello123!',
                    date_created: 'whatever'
                }
                return supertest(app)
                    .delete(testUser)
                    .expect(404,{
                        error: { message: `user does not exist`}
                    })
                    
            })
        })
    })

    describe(`GET /characters`, () => {
        context(`Given no characters`, () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get('/characters')
                    .expect(200, [])
            })
        })

        context('Given there are characters in the database', () => {
            const testCharacters = makeCharactersArray
            
            beforeEach('insert characters', () => {
            return db
                .into('characters')
                .insert(testCharacters)
            })
    
            it('GET /characters responds with 200 and all of the characters', () => {
                return supertest(app)
                  .get('/characters')
                  .expect(200, testCharacters)
            })
        })

        context(`Given an XSS attack characters`, () => {
            const maliciousCharacter = {
                id: 911,
                // ...need to fill this out
                // need to clean this data
            }
            beforeEach('insert malicious character', () => {
                return db
                    .into('characters')
                    .insert(maliciousCharacter)
            })
        
            it('removes XSS attack content', () => {
            return supertest(app)
                .get(`/characters`)
                .expect(200)
                .expect(res => {
                    // expect(res.body[0].title).to.eql('Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;')
                    // expect(res.body[0].description).to.eql(`Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`)
                })
            })
        })
    })

    describe(`POST /characters`, () => {
        context(`Given characters in the database`,()=>{
            it(`creates a character, responding with 201 and the new character`, function () {
                // this.retries(3)
                const newCharacter = {
                    auth: "0810bd3e-6112-4c27-a63f-c533e885495c",
                    username: "testcharacter",
                    user_id: 4,
                    char_name: "testy",
                    strength: 5,
                    intelligence: 2,
                    charisma: 2,
                    agility: 1,
                    current_level: 0,
                    current_points: 2,
                    wins: 1,
                    losses: 0,
                    attr_points: 0                    
                }
                return supertest(app)
                    .post('/characters')
                    .send(newCharacter)
                    // .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(201)
                    .expect( res =>{
                        console.log(res.body)
                        expect(res.body.auth).to.eql(updateCharacter.auth)
                        expect(res.body.username).to.eql(updateCharacter.username)
                        expect(res.body.user_id).to.eql(updateCharacter.user_id)
                        expect(res.body.char_name).to.eql(updateCharacter.char_name)
                        expect(res.body.strength).to.eql(updateCharacter.strength)
                        expect(res.body.intelligence).to.eql(updateCharacter.intelligence)
                        expect(res.body.charisma).to.eql(updateCharacter.charisma)
                        expect(res.body.agility).to.eql(updateCharacter.agility)
                        expect(res.body.wins).to.eql(updateCharacter.wins)
                        expect(res.body.losses).to.eql(updateCharacter.losses)
                        expect(res.body.attrPoints).to.eql(updateCharacter.attrPoints)
                        expect(res.body).to.have.property('id')
                    })
                    .then(postRes => 
                        supertest(app)
                            .get(`/characters/${postRes.body.id}`)
                            .expect(postRes.body)    
                    )
            })
    
            const requiredFields = ['auth', 'username', 'user_id', 'char_name', 'strength', 'intelligence', 'charisma', 'agility', 'current_level', 'current_points', 'wins', 'losses', 'attrPoints']
    
            requiredFields.forEach(field => {
                const newCharacter = {
                    auth: "newAuth",
                    username: "testcharacter",
                    user_id: 4,
                    char_name: "testy",
                    strength: 5,
                    intelligence: 2,
                    charisma: 2,
                    agility: 1,
                    current_level: 0,
                    current_points: 2,
                    wins: 1,
                    losses: 0,
                    attrPoints: 0                    
                }
    
                it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                    delete newCharacter[field]
                    return supertest(app)
                        .post('/bookmarks')
                        .send(newCharacter)
                        // .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                        .expect(400, {
                            error: { message: `Missing '${field}' in request body`}
                        })
                })
            })
    
            it(`responds with 400 invalid entry if not a valid attribute value, must be a number`, () => {
                const newInvalidCharacterAttribute = {
                    auth: "newAuth",
                    username: "testcharacter",
                    user_id: 4,
                    char_name: "testy",
                    strength: 5,
                    intelligence: 2,
                    charisma: 'a',
                    agility: 1,
                    current_level: 0,
                    current_points: 2,
                    wins: 1,
                    losses: 0,
                    attrPoints: 0                    
                }
                return supertest(app)
                    .post(`/characters`)
                    .send(newInvalidCharacterAttribute)
                    // .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(400, {error: { message: `attrubutes must be valid numbers` }
                    })
            })    
        })
                       
    })
    describe(`DELETE /characters`,()=>{

        context(`Given characters in the database`,()=>{ 
            const testCharacters = makeCharactersArray
            beforeEach('insert characters', () => {
                return db
                    .into('characters')
                    .insert(testCharacters)
            })   

            it(`responds with 404 if the character id does not exist`,()=>{
                const idToDelete = 99999999999
                return supertest(app)
                    .delete('characters')
                    .send(idToDelete)
                    .expect(404, {
                        error: { message: `character with id ${idToDelete} does not exist`}
                    } ) 

            })

            it(`deletes a character from the database`,()=>{
                const deleteCharacter = testCharacters[0]
                // body requires character id
                const idToDelete = deleteCharacter.id
                return supertest(app)
                    .delete('/characters')
                    .send(idToDelete)
                    .expect(204)
            })
        })

        context(`Given no characters in the database`,()=>{
            it(`returns an empty array`,()=>{
                const deleteCharacter = testCharacters[0]
                // body requires character id
                const idToDelete = deleteCharacter.id
                return supertest(app)
                    .delete('/characters')
                    .send(idToDelete)
                    .expect(204)
            })    
        })
        
    })
    describe(`PATCH /characters`, () => {
        it(`updates a character, responding with 201 and responds with the updated character object`, function () {
                       
            const updateCharacter = {
                auth: "0810bd3e-6112-4c27-a63f-c533e885495c",
                username: "testcharacter",
                user_id: 4,
                char_name: "testy",
                strength: 5,
                intelligence: 2,
                charisma: 2,
                agility: 1,
                current_level: 0,
                current_points: 2,
                wins: 1,
                losses: 0,
                attrPoints: 0                    
            }

            return supertest(app)
                .patch('/characters')
                .send(newCharacter)
                .expect(201)
                .expect( res =>{
                    console.log(res.body)
                    expect(res.body.auth).to.eql(updateCharacter.auth)
                    expect(res.body.username).to.eql(updateCharacter.username)
                    expect(res.body.user_id).to.eql(updateCharacter.user_id)
                    expect(res.body.char_name).to.eql(updateCharacter.char_name)
                    expect(res.body.strength).to.eql(updateCharacter.strength)
                    expect(res.body.intelligence).to.eql(updateCharacter.intelligence)
                    expect(res.body.charisma).to.eql(updateCharacter.charisma)
                    expect(res.body.agility).to.eql(updateCharacter.agility)
                    expect(res.body.wins).to.eql(updateCharacter.wins)
                    expect(res.body.losses).to.eql(updateCharacter.losses)
                    expect(res.body.attrPoints).to.eql(updateCharacter.attrPoints)
                    expect(res.body).to.have.property('id')
                    // expect(res.headers.location).to.eql(`/characters/${res.body.id}`)
                })
                .then(postRes => 
                    supertest(app)
                        .get(`/characters/${postRes.body.id}`)
                        // .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                        .expect(postRes.body)    
                )
        })

        const requiredFields = ['auth', 'username', 'user_id', 'char_name', 'strength', 'intelligence', 'charisma', 'agility', 'current_level', 'current_points', 'wins', 'losses', 'attrPoints']

        requiredFields.forEach(field => {
            const newCharacter = {
                auth: "newAuth",
                username: "testcharacter",
                user_id: 4,
                char_name: "testy",
                strength: 5,
                intelligence: 2,
                charisma: 2,
                agility: 1,
                current_level: 0,
                current_points: 2,
                wins: 1,
                losses: 0,
                attrPoints: 0                    
            }

            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                delete newCharacter[field]
                return supertest(app)
                    .post('/bookmarks')
                    .send(newCharacter)
                    // .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body`}
                    })
            })
        })

        it(`responds with 400 invalid entry if not a valid attribute value, must be a number`, () => {
            const newInvalidCharacterAttribute = {
                auth: "newAuth",
                username: "testcharacter",
                user_id: 4,
                char_name: "testy",
                strength: 5,
                intelligence: 2,
                charisma: 'a',
                agility: 1,
                current_level: 0,
                current_points: 2,
                wins: 1,
                losses: 0,
                attrPoints: 0                    
            }
            return supertest(app)
                .post(`/characters`)
                .send(newInvalidCharacterAttribute)
                // .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(400, {error: { message: `attrubutes must be valid numbers` }
                })
        })

        it(`updates the level when new level has been reached`,() => {
            const updateCharacter = {
                auth: "newAuth",
                username: "testcharacter",
                user_id: 4,
                char_name: "testy",
                strength: 5,
                intelligence: 2,
                charisma: 2,
                agility: 1,
                current_level: 0,
                current_points: 50,
                wins: 1,
                losses: 0,
                attrPoints: 0                    
            }
            return supertest(app)
                .patch(`/characters`)
                .send(updateCharacter)
                .expect(201)
                .expect(res => {
                    expect(res.body.current_level).to.eql(1) 
                })
        })
    })

    describe(`GET /characters/:id`, () => {
        context(`Given no characters`, () => {
            it(`responds with 404`, () => {
            const userId = 123456
            return supertest(app)
                .get(`/bookmarks/${userId}`)
                // .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(404, { error: { message: `User with id ${req.query.userId} does not have a character`} })
            })
        })

        context('Given there are characters in the database', () => {
            const testCharacters = makeCharactersArray
            
            beforeEach('insert characters', () => {
            return db
                .into('characters')
                .insert(testCharacters)
            })
    
            it('GET /characters/:id responds with 200 and the specified character', () =>{
                const userId = 2
                const expectedCharacter = testCharacters.find(char => char.user_id === userId)
                return supertest(app)
                    .get(`/bookmarks/${userId}`)
                    .expect(200, expectedCharacter)
            })

            it(`responds with 404 if user does not have a character`, () => {
                const userId = 123456
                return supertest(app)
                    .get(`/bookmarks/${userId}`)
                    .expect(404, { error: { message: `User with id ${req.query.userId} does not have a character`} })
                })
        })

        // Workin on it
        context(`Given an XSS attack on Characters`, () => {
            const maliciousBookmark = {
                id: 911,
                title: 'Naughty naughty very naughty <script>alert("xss");</script>',
                url: 'https://www.fakebad.com',
                description: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
                rating: 0
            }
            beforeEach('insert malicious bookmark', () => {
                return db
                    .into('bookmarks')
                    .insert(maliciousBookmark)
            })
            
            it('removes XSS attack content', () => {
            return supertest(app)
                .get(`/bookmarks/${maliciousBookmark.id}`)                
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(200)
                .expect(res => {
                    expect(res.body.title).to.eql('Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;')
                    expect(res.body.description).to.eql(`Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`)
                })
            })
        })
    })
})