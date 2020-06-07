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
            const testUsers = makeUsersArray()
            
            beforeEach('insert users', ()=>{
                return db
                .into('users')
                .insert(testUsers) 
            })

            it(`responds with 200 and returns true login and user object`,()=>{
                const testUser = testUsers[0];
                const testUserObject = {
                    username: testUser.username,
                    passw: testUser.passw
                }
                return supertest(app)
                    .post('api/vfc/login')
                    .send(testUserObject)
                    .expect(200)
            })
            it(`responds with 404 not found if user data doesn't exist`,()=>{
                const testUserObject = {
                    username: somerandomwrongusername,
                    passw: somereallybadpassword
                }
                return supertest(app)
                    .post('api/vfc/login')
                    .send(testUserObject)
                    .expect(404)
            })
        })
    })

    describe(`POST /users`, () => {
        context(`given data in the database`, () => {
            const testUsers = makeUsersArray()
            
            beforeEach('insert users', () => {
                return db
                    .into('users')
                    .insert(testUsers)
            })
            
            it(`responds with 400 if username is not provided`, ()=>{
                const testUser = {
                    username: '',
                    passw: 'hello123!'
                }
                return supertest(app)
                    .post('/api/vfc/users')
                    .send(testUser)
                    .expect(400,{
                        error: { 
                            message: `Username is required`}
                        })
                    
            })
            it(`responds with 400 if password is not provided`,()=>{
                const testUser = {
                    username: 'username',
                    passw: ''
                }
                return supertest(app)
                    .post('/api/vfc/users')
                    .send(testUser)
                    .expect(400,{
                        error: { 
                            message: `Password is required`}
                        })
            })
            it(`responds with 400 if username does not meet parameters`,()=>{
                const testUser = {
                    username: 'us',
                    passw: 'hello123!'
                }
                return supertest(app)
                    .post('/api/vfc/users')
                    .send(testUser)
                    .expect(400,{
                        error: { 
                            message: `Username must be between 6 and 20 characters`}
                        })
            })
            it(`responds with 400 if password does not meet parameters`,()=>{
                const testUser = {
                    username: 'username',
                    passw: 'hello'
                }
                return supertest(app)
                    .post('/api/vfc/users')
                    .send(testUser)
                    .expect(400,{
                        error: { 
                            message: 'Password must be contain at least one digit and one special character'}
                        })
            })

            it(`responds with 400 if username already exists`, ()=>{
                const testUsers = makeUsersArray()
                const testUser = testUsers[0]
                return supertest(app)
                    .post('/api/vfc/users')
                    .send(testUser)
                    .expect(400,{
                        error: { 
                            message: `username is already in use, pick another name`}
                        })
            })

            it(`responds with 201 when user is successfully created`,()=>{
                const testUser = {
                    id: 5,
                    username: 'username1',
                    passw: 'hello123!'
                }
                return supertest(app)
                    .post('/api/vfc/users')
                    .send(testUser)
                    .expect(201)
                    .expect(res=>{
                        // res is whole users list, need to create test id to grab
                        expect(res.body.username).to.eql(testUser.username)
                        expect(res.body.id).to.eql(testUser.id)
                    })
            })
        })
    })

  
    describe(`DELETE /users`, () => {
        // WORKS
        context(`given data in the database`, () => {
            const testUsers = makeUsersArray()
            beforeEach('insert users', () => {
                return db
                    .into('users')
                    .insert(testUsers)
            })

            const testCharacters = makeCharactersArray()
            beforeEach('insert users', () => {
                return db
                    .into('characters')
                    .insert(testCharacters)
            })
        

            it(`responds with 204 and removes the user and corresponding character`,()=>{
                const testUser = testUsers[0]
                const expectedUsers = testUsers.filter(user => user.id !== testUser.id)
                
                return supertest(app)
                    .delete('/api/vfc/users')
                    .send(testUser)
                    .expect(204)
                    .then(postRes => 
                        supertest(app)
                            .get(`/api/vfc/users`)
                            .expect(res=>{
                                expect(expectedUsers)
                            })    
                    )
            })

            it(`responds with 404 if the user does not exist`,()=>{
                const testUser = {
                    id: 123456677,
                    auth: 'madeupauth',
                    username: 'username',
                    passw: 'hello123!',
                    date_created: '2029-01-22T16:28:32.615Z'
                }
                return supertest(app)
                    .delete('/api/vfc/users')
                    .send(testUser)
                    .expect(404,{
                        error: { message: `user does not exist`}
                    })
                    
            })
        })
    })

    describe(`GET /characters`, () => {
        // WORKS
        context(`Given no characters`, () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get('/api/vfc/characters')
                    .expect(200, [])
            })
        })

        context('Given there are characters in the database', () => {
            const testCharacters = makeCharactersArray()
            beforeEach('insert characters', () => {
            return db
                .into('characters')
                .insert(testCharacters)
            })
            it('GET /characters responds with 200 and all of the characters', () => {
                return supertest(app)
                  .get('/api/vfc/characters')
                  .expect(200)
                  .expect(res =>{
                    expect(testCharacters)
                  })
            })
        })

        context(`Given an XSS attack characters`, () => {
            const testCharacters = makeCharactersArray()

            beforeEach('insert characters', () => {
            return db
                .into('characters')
                .insert(testCharacters)
            })

            const maliciousCharacter = {
                id: 5,           
                auth: "newAuth",
                username: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
                user_id: 4,
                char_name: `Naughty naughty very naughty <script>alert("xss");</script>`,
                strength: 5,
                intelligence: 2,
                charisma: 2,
                agility: 1,
                current_level: 0,
                current_points: 50,
                wins: 1,
                losses: 0,
                attrpoints: 0 
            }
            beforeEach('insert malicious character', () => {
                return db
                    .into('characters')
                    .insert(maliciousCharacter)
            })
        
            it('removes XSS attack characters', () => {
            return supertest(app)
                .get(`/api/vfc/characters`)
                .expect(200)
                .expect(res => {
                    expect(res.body[4].char_name).to.eql(`Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;`)
                    expect(res.body[4].username).to.eql(`Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`)
                })
            })
        })
    })

    describe(`POST /characters`, () => {
        // WORKS
        context(`Given characters in the database`,()=>{
            const testCharacters = makeCharactersArray()

            beforeEach('insert characters', () => {
            return db
                .into('characters')
                .insert(testCharacters)
            })

            it(`creates a character, responding with 201 and the new character`, function () {
                const newCharacter = {
                    id: 5,
                    auth: "0810bd3e-6112-4c27-a63f-c533e885495c",
                    username: "testcharacter",
                    user_id: 5,
                    char_name: "testy",
                    strength: 5,
                    intelligence: 2,
                    charisma: 2,
                    agility: 1,
                    current_level: 0,
                    current_points: 0,
                    wins: 1,
                    losses: 0,
                    attrpoints: 0                    
                }
                return supertest(app)
                    .post('/api/vfc/characters')
                    .send(newCharacter)
                    // .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(201)
                    .expect( res =>{
                        expect(res.body.auth).to.eql(newCharacter.auth)
                        expect(res.body.username).to.eql(newCharacter.username)
                        expect(res.body.user_id).to.eql(newCharacter.user_id)
                        expect(res.body.char_name).to.eql(newCharacter.char_name)
                        expect(Number(res.body.strength)).to.eql(Number(newCharacter.strength))
                        expect(Number(res.body.intelligence)).to.eql(Number(newCharacter.intelligence))
                        expect(Number(res.body.charisma)).to.eql(Number(newCharacter.charisma))
                        expect(Number(res.body.agility)).to.eql(Number(newCharacter.agility))
                        expect(Number(res.body.wins)).to.eql(Number(newCharacter.wins))
                        expect(Number(res.body.losses)).to.eql(newCharacter.losses)
                        expect(Number(res.body.attrpoints)).to.eql(newCharacter.attrpoints)
                        expect(res.body).to.have.property('id')
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
                    attrpoints: 0                    
                }
                return supertest(app)
                    .post(`/api/vfc/characters`)
                    .send(newInvalidCharacterAttribute)
                    // .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(400, {error: { message: `You cannot include characters in your submission, please ensure that the attribute points are numbers.` }
                    })
            })    
        })                 
    })

    describe(`DELETE /characters`,()=>{
        context(`Given characters in the database`,()=>{ 
            const testCharacters = makeCharactersArray()
            beforeEach('insert characters', () => {
                return db
                    .into('characters')
                    .insert(testCharacters)
            })   

            it(`responds with 404 if the character id does not exist`,()=>{
                const idToDelete = 9999999
                return supertest(app)
                    .delete('/api/vfc/characters')
                    .send({ id: idToDelete })
                    .expect(404, {
                        error: { message: `character with id ${idToDelete} does not exist`}
                    } ) 

            })

            it(`deletes a character from the database`,()=>{
                const deleteCharacter = testCharacters[0]
                // body requires character id
                const idToDelete = deleteCharacter.id
                return supertest(app)
                    .delete('/api/vfc/characters')
                    .send({id: idToDelete})
                    .expect(204)
            })
        })

        context(`Given no characters in the database`,()=>{
            const testCharacters = makeCharactersArray()
            beforeEach('insert characters', () => {
                return db
                    .into('characters')
                    .insert(testCharacters)
            }) 

            it(`returns an empty array`,()=>{
                const deleteCharacter = testCharacters[0]
                // body requires character id
                const idToDelete = deleteCharacter.id
                return supertest(app)
                    .delete('/api/vfc/characters')
                    .send({id: idToDelete})
                    .expect(204)
            })    
        })
        
    })

    describe(`PATCH /characters`, () => {
        const testCharacters = makeCharactersArray()

        beforeEach('insert characters', () => {
        return db
            .into('characters')
            .insert(testCharacters)
        })

        it(`updates a character, responding with 201 and responds with the updated character object`, function () {
                       
            const updateCharacter = {
                id: 4,
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
                attrpoints: 0                    
            }

            return supertest(app)
                .patch('/api/vfc/characters')
                .send(updateCharacter)
                .expect(201)
                .expect( res =>{
                    expect(res.body.auth).to.eql(updateCharacter.auth)
                    expect(res.body.username).to.eql(updateCharacter.username)
                    expect(res.body.user_id).to.eql(updateCharacter.user_id)
                    expect(res.body.char_name).to.eql(updateCharacter.char_name)
                    expect(Number(res.body.strength)).to.eql(updateCharacter.strength)
                    expect(Number(res.body.intelligence)).to.eql(updateCharacter.intelligence)
                    expect(Number(res.body.charisma)).to.eql(updateCharacter.charisma)
                    expect(Number(res.body.agility)).to.eql(updateCharacter.agility)
                    expect(Number(res.body.wins)).to.eql(updateCharacter.wins)
                    expect(Number(res.body.losses)).to.eql(updateCharacter.losses)
                    expect(Number(res.body.attrpoints)).to.eql(updateCharacter.attrpoints)
                    expect(res.body).to.have.property('id')
                })
        })

        it(`responds with 400 invalid entry if not a valid attribute value, must be a number`, () => {
            const newInvalidCharacterAttribute = {
                id: 4,
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
                attrpoints: 0                    
            }
            return supertest(app)
                .patch(`/api/vfc/characters`)
                .send(newInvalidCharacterAttribute)
                // .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(400, {error: { message: `You cannot include characters in your submission, please ensure that the attribute points are numbers.` }})
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
                attrpoints: 0                    
            }
            return supertest(app)
                .patch(`/api/vfc/characters`)
                .send(updateCharacter)
                .expect(201)
                .expect(res => {
                    expect(Number(res.body.current_level)).to.eql(1) 
                })
        })
    })

    describe(`GET /characters/:id`, () => {
        context(`Given no characters`, () => {
            it(`responds with 404`, () => {
            const userId = 123456
            return supertest(app)
                .get(`/api/vfc/characters/${userId}`)
                // .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(404, { error: { message: `User with id ${userId} does not have a character`} })
            })
        })

        context('Given there are characters in the database', () => {
            const testCharacters = makeCharactersArray()
            
            beforeEach('insert characters', () => {
            return db
                .into('characters')
                .insert(testCharacters)
            })

            const testUsers = makeUsersArray()
            
            beforeEach('insert users', () => {
                return db
                    .into('users')
                    .insert(testUsers)
            })
    
            it('GET /characters/:id responds with 200 and the specified character', () =>{
                const userId = 2
                const expectedCharacter = testCharacters.find(char => char.user_id === userId)
                return supertest(app)
                    .get(`/api/vfc/characters/${userId}`)
                    // .expect(200, expectedCharacter)
                    .expect(200)
                    .expect(res =>{
                        expect(res.body.auth).to.eql(expectedCharacter.auth)
                        expect(res.body.username).to.eql(expectedCharacter.username)
                        expect(res.body.user_id).to.eql(expectedCharacter.user_id)
                        expect(res.body.char_name).to.eql(expectedCharacter.char_name)
                        expect(Number(res.body.strength)).to.eql(expectedCharacter.strength)
                        expect(Number(res.body.intelligence)).to.eql(expectedCharacter.intelligence)
                        expect(Number(res.body.charisma)).to.eql(expectedCharacter.charisma)
                        expect(Number(res.body.agility)).to.eql(expectedCharacter.agility)
                        expect(Number(res.body.wins)).to.eql(expectedCharacter.wins)
                        expect(Number(res.body.losses)).to.eql(expectedCharacter.losses)
                        expect(Number(res.body.attrpoints)).to.eql(expectedCharacter.attrpoints)
                        expect(res.body).to.have.property('id')
                    })
            })

            it(`responds with 404 if user does not have a character`, () => {
                const userId = 123456
                return supertest(app)
                    .get(`/api/vfc/characters/${userId}`)
                    .expect(404, { error: { message: `User with id ${userId} does not have a character`} })
                })
        })

        context(`Given an XSS attack on Characters`, () => {
            
            const testUser = {
                id: 911,
                auth: 'randomestAuth',
                username: 'testUserMal',
                passw: 'someHashedPasssword',
                date_created: '2029-01-22T16:28:32.615Z'
            }
            
            beforeEach('insert user', () => {
                return db
                    .into('users')
                    .insert(testUser)
            })
            const maliciousCharacter = {
                id: 911,           
                auth: "newAuth",
                username: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
                user_id: 911,
                char_name: 'Naughty naughty very naughty <script>alert("xss");</script> Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.',
                strength: 5,
                intelligence: 2,
                charisma: 2,
                agility: 1,
                current_level: 0,
                current_points: 50,
                wins: 1,
                losses: 0,
                attrpoints: 0 
            }

            beforeEach('insert malicious character', () => {
                return db
                    .into('characters')
                    .insert(maliciousCharacter)
            })
            
            it('removes XSS attack characters', () => {
            return supertest(app)
                .get(`/api/vfc/characters/${maliciousCharacter.user_id}`)                
                .expect(200)
                .expect(res => {
                    console.log(res.body)
                    expect(res.body.char_name).to.eql('Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt; Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.')
                })
            })
        })
    })
    describe(`GET /matches`,()=>{
        context(`given no matches in the database`,()=>{
            it(`returns an empty array`,()=>{
                return supertest(app)
                    .get(`/api/vfc/matches`)
                    .expect(200,{matches:[]})
            })
        })
        context(`given matches in the database`,()=>{
            const testMatches = makeMatchesArray()
            beforeEach('insert matches', () => {
                return db
                    .into('matches')
                    .insert(testMatches)
            })

            it(`returns 200 and the matches`,()=>{
                return supertest(app)
                    .get(`/api/vfc/matches`)
                    .expect(200)
                    .expect(res=>{
                        console.log(res.body.matches)
                        expect(res.body.matches[1].id).to.eql(testMatches[1].id)
                        expect(res.body.matches[1].char_1_id).to.eql(testMatches[1].char_1_id)
                        expect(res.body.matches[1].char_2_id).to.eql(testMatches[1].char_2_id)
                        expect(res.body.matches[1].winner).to.eql(testMatches[1].winner)
                        expect(res.body.matches[1].loser).to.eql(testMatches[1].loser)
                        expect(Number(res.body.matches[1].points)).to.eql(testMatches[1].points)
                    })
            })
        })
    })
    describe(`POST /matches`,()=>{
        const testMatch = {
            id: 1,
            char_1_id: 2,
            char_2_id: 1,
            winner: 'test-user-1',
            loser: 'test-user-2',
            points: 2
        }
        it(`responds with 201 and the match object`,()=>{
            return supertest(app)
                .post(`/api/vfc/matches`)
                .send(testMatch)
                .expect(201)
                .expect(res=>{
                    console.log(res.body.match)
                        expect(res.body.match.id).to.eql(testMatch.id)
                        expect(res.body.match.char_1_id).to.eql(testMatch.char_1_id)
                        expect(res.body.match.char_2_id).to.eql(testMatch.char_2_id)
                        expect(res.body.match.winner).to.eql(testMatch.winner)
                        expect(res.body.match.loser).to.eql(testMatch.loser)
                        expect(Number(res.body.match.points)).to.eql(testMatch.points)
                })
        })
    })
})