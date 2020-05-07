require('dotenv').config()
const express = require('express')
const { uuid } = require('uuidv4')
const logger = require('../logger')
const vfcRouter = express.Router()
const VfcService = require('./vfc-service')
const xss = require('xss')

const bodyParser = express.json()

// Create logout endpoint as well!

vfcRouter
.route('/login')
.post(bodyParser, (req, res, next) => {
    // WORKS
    const loginInfo = req.body;
    const username = loginInfo.username;
    const passw = loginInfo.password;
    const knexInstance = req.app.get('db')

    console.log(username, passw)

    // validation code here
    if (!username) {
        return res
          .status(400)
          .send('Username required');
    }
    
    if (!passw) {
    return res
        .status(400)
        .send('Password required');
    }

    VfcService.getIdByLogin(knexInstance, username, passw)
        .then(user => {
            if (!user) {
                logger.error(`User with username ${username} and password ${passw} not found`)
                return res.status(404).json({
                    error: { message: `Please verify login information`}
                })
            }
            res.json({
                login: true,
                user: user[0]
            })
        })
        .catch(next)
})

vfcRouter
.route('/users')
.get(bodyParser, (req, res, next) => {
    // WORKS
    // receives login (true), userId, 
    // use query for this not request body - not needed
    const knexInstance = req.app.get('db')
    console.log(req.query)
    if (req.query.login !== 'true') {
        return res
          .status(400)
          .send('Must be logged in to receive characters list');
    }
    VfcService.getById(knexInstance, req.query.userId) 
    .then(user => {
        if (!user) {
            logger.error(`user with id ${user.id} does not exist`)
            return res.status(404).json({
                error: { message: `User with id ${req.query.userId} does not exist`}
            })
        }
        res.status(200)
    })

    VfcService.getAllUsers(knexInstance)
    .then(users => {
        // NEED TO CLEAN
        res.json({users})    
    })
    .catch(next)
})
.post(bodyParser, (req, res, next) => {
    // WORKS
    // create new user
    // need to create a token here for "auth"
    const knexInstance = req.app.get('db')
    
    const username = req.body.username;
    const passw = req.body.passw;

    console.log(username, passw)
    const newUser = {
        auth: uuid(),
        username: username, 
        passw: passw
    }
    // validation code here
    if (!username) {
        return res
          .status(400).json({
            error: { message: `Username is required`}
          })
    }

    if (!passw) {
        return res
            .status(400).json({
                error: { message: `Password is required`}
            })
    }   

    if (username.length < 4 || username.length > 12) {
        return res
            .status(400).json({
                error: { message: `Username must be between 6 and 20 characters`}
            })       
    }

    
    // password contains digit, one special character, and is between 7 and 15 characters long, using a regex here
    if (!passw.match(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,15}$/)) {
        return res
            .status(400).json({
                error: { message: 'Password must be contain at least one digit and one special character' }
            })
    }

    // need to update the table with new user data using vfc-service and updateUsers()
    VfcService.insertUser(knexInstance,newUser)
    .then(user => {
        if (!user) {
            logger.error(`user information is not correct. check to make sure that username and auth are unique`)
            return res.status(400).json({
                error: { message: `username is already in use, pick another name`}
            })
        }
        logger.info(`User with id ${user.id} created`)
        res
        .status(201)
        .location(`http://localhost:8000/users/${user.id}`)
        .json({user})
        
    })
    .catch(next)
})
.delete((req, res, next)=>{
    const knexInstance = req.app.get('db')
    const user = req.body;
    VfcService.deleteUser(knexInstance, user.id)
        .then(user => {
            if (!user) {
                logger.error(`user with id ${user.id} does not exist`)
                return res.status(404).json({
                    error: { message: `user does not exist`}
                })
            }
            logger.info(`User with id ${user.id} was deleted`)
            res.status(204).json({
                user_id: user.id
            })
        })
        .catch(next)
})

vfcRouter
.route('/characters')
.get((req, res, next) => {
    // WORKS
    // receives login (true), userId, 
    const knexInstance = req.app.get('db')

    VfcService.getAllCharacters(knexInstance)
    .then(characters => {
        // NEED TO CLEAN
        res.json({characters})    
    })
    .catch(next)
    
})
.post(bodyParser, (req, res, next) =>{
    // WORKS
    // 1) should add a character
    // 2) should update attrPoints and level after each match
    // 3) should update attributes if there are attribute points to give
    // need to verify that all number inputs are numbers/convert them on client side?

    // receives username, all character attributes, user id, 
    const knexInstance = req.app.get('db')
    const character = req.body;
    console.log(character)
    const user_id = character.user_id;
    const char_name = character.char_name;
    const strength = Number(character.strength);
    const intelligence = Number(character.intelligence);
    const charisma = Number(character.charisma);
    const agility = Number(character.agility);
    const current_level = Number(character.current_level);
    const current_points = Number(character.current_points);
   
    
    if (strength == NaN || intelligence == NaN || charisma == NaN || agility == NaN ) {
        res.status(404).send({
            error: { message: `You cannot include characters in your submission, please ensure that the attribute points are numbers.` }
        })
    }

    // there is already a verification on client side for them not to go past 10 points for attributes. all data sent should be OK.
    let error = Object.keys(character).map(data => {
        if (!data) {
            res.status(400).send({
                error: { message: `Missing field ${data} in request body` }
            })
        }
    })

    // 1) should create a character
    if (current_level === 0 && current_points === 0) {
        // should clean this data
        VfcService.insertCharacter(knexInstance, character)
        .then(character =>{
            logger.info(`Character with name ${char_name} was created for user ${user_id}`)
            res
                .status(201)
                .json(character[0])
        })
        .catch(next)
    }
})
.delete(bodyParser,(req, res, next) =>{
// WORKS
    // receives id from the character table
    const knexInstance = req.app.get('db')
    console.log(req.body)
    VfcService.deleteCharacter(knexInstance, req.body.id)
    .then(character => {
        if (!character) {
            logger.error(`character with id ${id} does not exist`)
            return res.status(404).json({
                error: { message: `character with id ${id} does not exist`}
            })
        }
        logger.info(`Character with id ${id} was deleted`)
        res.status(204).end();
    })
    .catch(next)
})
.patch(bodyParser,(req,res,next)=> {
    
    // 1) should update attrPoints and level after each match
    // 2) should update attributes if there are attribute points to give
    // need to verify that all number inputs are numbers/convert them on client side?

    // receives username, all character attributes, user id, 
    const knexInstance = req.app.get('db')
    const character = req.body;
    console.log(character)
    const user_id = character.user_id;
    const strength = Number(character.strength);
    const intelligence = Number(character.intelligence);
    const charisma = Number(character.charisma);
    const agility = Number(character.agility);
    const current_points = Number(character.current_points);
    const attr_points = Number(character.attr_points);
    
    if (strength == NaN || intelligence == NaN || charisma == NaN || agility == NaN ) {
        res.status(404).send({
            error: { message: `You cannot include characters in your submission, please ensure that the attribute points are numbers.` }
        })
    }

    // there is already a verification on client side for them not to go past 10 points for attributes. all data sent should be OK.
    let error = Object.keys(character).map(data => {
        if (!data) {
            res.status(400).send({
                error: { message: `Missing field ${data} in request body` }
            })
        }
    })

    
    // 1) should update points and level after each match
    // check for level up and add 10 attribute points
    if (current_points > 0 && current_points%50 === 0) {
        let newLevel = (current_points/50)+1;
        newCharacterFields = {
            ...character,
            strength: strength,
            intelligence: intelligence,
            charisma: charisma,
            agiligy: agility,
            current_points: current_points,
            current_level: newLevel,
            attr_points: attr_points + 10
        }
        VfcService.updateCharacter(knexInstance, user_id, newCharacterFields)
        .then(character =>{
            res
            .status(201)
            .json(character[0])
        })
        .catch(next)
    }

    // 2) should update attributes if there are attribute points to give
   else {
        VfcService.updateCharacter(knexInstance, user_id, character)
        .then(character =>{
            logger.info(`character with id ${character.id} was updated`)
            res
            .status(201)
            .json(character[0])
        })
        .catch(next)
    }
})

vfcRouter
.route('/matches')
.get((req, res, next) => {
    // WORKS
    const knexInstance = req.app.get('db')
    VfcService.getAllMatches(knexInstance)
    .then(matches =>{
       res.status(200).json({matches}) 
    })
    .catch(next)
})
.post(bodyParser, (req, res, next) => {
    // WORKS
    // put the character ids as a query
    // receives char_1_id, char_2_id, winner, loser, points
    const knexInstance = req.app.get('db');
    const newMatch = req.body;
    console.log(req.body)
    VfcService.insertMatches(knexInstance, newMatch)
    .then(match => {
        console.log(match)
        logger.info(`match with id ${match.id} was added`)
        res
            .status(201)
            .json({match})
    })
    .catch(next)
})

vfcRouter
.route('/characters/:userId')
.get(bodyParser, (req,res,next)=>{
    // WORKS
    // receives login (true), userId, 
    // use query for this not request body - not needed
    // need to verify auth
    
    const knexInstance = req.app.get('db')
    VfcService.getById(knexInstance, req.query.userId) 
    .then(user => {
        if (!user) {
            logger.error(`user with id ${req.query.userId} does not exist`)
            return res.status(404).json({
                error: { message: `User with id ${req.query.userId} does not have a character`}
            })
        }
        res.status(200)
    })

    VfcService.getCharacterById(knexInstance,req.query.userId)
    .then(character => {
        // NEED TO CLEAN
        res.json({character})    
    })
    .catch(next)
})

module.exports = vfcRouter




  