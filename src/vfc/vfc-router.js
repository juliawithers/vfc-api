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

        console.log(username +' and '+ passw)
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

        VfcService.getByUsername(knexInstance, username)
            .then(user => {
                if (!user) {
                    logger.error(`user information is not correct. check to make sure that username and auth are unique`)
                    return res.status(400).json({
                        error: { message: `Username or password is incorrect, please try again` }
                    })
                }
                console.log(user)
                // the issue is that passw is being hashed, how can I hash the seeding? 
                VfcService.comparePassword(passw, user.passw)
                    .then(match => {
                        if (!match) {
                            logger.error(`wrong password entered for user ${username}`)
                            return res.status(400).json({
                                error: `Username or password is incorrect, please try again`
                            })
                        }
                        res
                            .status(201)
                            .json({
                                login: true, 
                                user: {
                                    id: user.id,
                                    auth: user.auth,
                                    username: user.username
                                }})
                        // create auth token???

                    })
                    .catch(next)
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
                        error: { message: `User with id ${req.query.userId} does not exist` }
                    })
                }
                res.status(200)
            })

        VfcService.getAllUsers(knexInstance)
            .then(users => {
                res.json(users.map(user => {
                    VfcService.cleanUsers(user)
                }))
            })
            .catch(next)
    })
    .post(bodyParser, (req, res, next) => {
        // WORKS
        // create new user
        // need to create a token here for "auth"
        const knexInstance = req.app.get('db')
        const userBody = req.body;
        const username = req.body.username;
        const passw = req.body.passw;

        // validation code here
        if (!username) {
            return res
                .status(400).json({
                    error: { message: `Username is required` }
                })
        }

        if (!passw) {
            return res
                .status(400).json({
                    error: { message: `Password is required` }
                })
        }

        if (username.length < 4 || username.length > 12) {
            return res
                .status(400).json({
                    error: { message: `Username must be between 6 and 20 characters` }
                })
        }


        // password contains digit, one special character, and is between 7 and 15 characters long, using a regex here
        if (!passw.match(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,15}$/)) {
            return res
                .status(400).json({
                    error: { message: 'Password must be contain at least one digit and one special character' }
                })
        }
    
        VfcService.getByUsername(knexInstance, username)
            .then(user => {
                if (user) {
                    logger.error(`user information is not correct. check to make sure that username and auth are unique`)
                    return res.status(400).json({
                        error: { message: `username is already in use, pick another name` }
                    })
                }
                
                VfcService.hashPassword(passw)
                .then(hashedPassword => {
                    const newUser = {
                        ...userBody,
                        auth: uuid(),
                        username,
                        passw: hashedPassword,
                    }
                    return VfcService.insertUser(knexInstance, newUser)
                })
                .then(user => {
                    const cleanUser = VfcService.cleanUsers(user)
                    const returnUser = {
                        id: cleanUser.id,
                        auth: cleanUser.auth,
                        username: cleanUser.username,
                    }
                    logger.info(`User with id ${user.id} created`)
                    res
                        .status(201)
                        .json(returnUser)
                })
                .catch(next)
            })
            .catch(next)
    })

.delete (bodyParser, (req, res, next) => {
    const knexInstance = req.app.get('db')
    const userId = req.body.id
    VfcService.deleteUser(knexInstance, userId)
        .then(user => {
            if (!user) {
                logger.error(`user with id ${userId} does not exist`)
                return res.status(404).json({
                    error: { message: `user does not exist` }
                })
            }
            return VfcService.getCharacterById(knexInstance, userId)
        })
        .then(character => {
            if(!character) {
                logger.error(`user does not have a character to delete, account deleted`)
                res.status(204).json({
                    user_id: userId
                })
            } 
            const charId = character.id
            return VfcService.deleteCharacter(knexInstance, charId)   
        })
        .then(charId => {
            logger.info(`User with id ${userId} was deleted along with character with id ${charId}`)
            res.status(204).json({
                user_id: userId
            })
        })
        .catch(next)
})

vfcRouter
    .route('/characters')
    .get((req, res, next) => {
        // WORKS
        const knexInstance = req.app.get('db')

        VfcService.getAllCharacters(knexInstance)
            .then(characters => {
                res.json(characters.map(character => {
                   return VfcService.cleanCharacter(character)
                }))
                // res.json(characters)
            })
            .catch(next)

    })
    .post(bodyParser, (req, res, next) => {
        // WORKS
        // receives username, all character attributes, user id, 
        const knexInstance = req.app.get('db')
        const character = req.body;
        
        const user_id = character.user_id;
        const char_name = character.char_name;
        const strength = Number(character.strength);
        const intelligence = Number(character.intelligence);
        const charisma = Number(character.charisma);
        const agility = Number(character.agility);
        const current_level = Number(character.current_level);
        const current_points = Number(character.current_points);

        if (isNaN(strength) || isNaN(intelligence) || isNaN(charisma) || isNaN(agility)) {
            return res.status(400).json({
                error: { message: `You cannot include characters in your submission, please ensure that the attribute points are numbers.` }
            })
        }

        if (current_level === 0 && current_points === 0) {
            const newChar = {
                ...character,
                attrpoints: 0
            }
            VfcService.insertCharacter(knexInstance, newChar)
                .then(character => {
                    logger.info(`Character with name ${char_name} was created for user ${user_id}`)
                    return res
                        .status(201)
                        .json(VfcService.cleanCharacter(character))
                })
                .catch(next)
        }
    })
    .delete(bodyParser, (req, res, next) => {
        // WORKS
        // receives id from the character table
        const knexInstance = req.app.get('db')
        VfcService.deleteCharacter(knexInstance, req.body.id)
            .then(character => {             
                if (!character) {
                    logger.error(`character with id ${req.body.id} does not exist`)
                    return res.status(404).json({
                        error: { message: `character with id ${req.body.id} does not exist` }
                    })
                }
                logger.info(`Character with id ${req.body.id} was deleted`)
                res.status(204).end();
            })
            .catch(next)
    })
    .patch(bodyParser, (req, res, next) => {
        // receives username, all character attributes, user id, 
        const knexInstance = req.app.get('db')
        const character = req.body;

        const user_id = character.user_id;
        const strength = Number(character.strength);
        const intelligence = Number(character.intelligence);
        const charisma = Number(character.charisma);
        const agility = Number(character.agility);
        const current_points = Number(character.current_points);
        const attr_points = Number(character.attrpoints);

        if (isNaN(strength) || isNaN(intelligence) || isNaN(charisma) || isNaN(agility)) {
            return res.status(400).json({
                error: { message: `You cannot include characters in your submission, please ensure that the attribute points are numbers.` }
            })
        }

        if (current_points > 0 && current_points % 50 === 0) {
            let newLevel = (current_points / 50);
            
            let newCharacterFields = {
                ...character,
                strength: strength,
                intelligence: intelligence,
                charisma: charisma,
                agility: agility,
                current_points: current_points,
                current_level: newLevel,
                attrpoints: attr_points + 10
            }
            const cleanedChar = VfcService.cleanCharacter(newCharacterFields)

            VfcService.updateCharacter(knexInstance, user_id, cleanedChar)
                .then(res => {
                    if (!res) {
                        res.status(404).json({
                            error: { message: `the character with id ${newCharacterFields.id} does not exist`}
                        })
                    }
                    return VfcService.getCharacterById(knexInstance, user_id) 
                })
                .then(character => {
                    logger.info(`character with id ${character.id} was updated`)
                    res
                        .status(201)
                        .json(character) 
                })  
            .catch(next)
        }
        else {
            const cleanedChar = VfcService.cleanCharacter(character)
            VfcService.updateCharacter(knexInstance, user_id, cleanedChar)
                .then(res => {
                    return VfcService.getCharacterById(knexInstance, user_id)
                })
                .then(character => {
                    logger.info(`character with id ${character.id} was updated`)
                    return res
                        .status(201)
                        .json(character) 
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
            .then(matches => {
                res.status(200).json({ matches })
            })
            .catch(next)
    })
    .post(bodyParser, (req, res, next) => {
        // WORKS
        // put the character ids as a query
        // receives char_1_id, char_2_id, winner, loser, points
        const knexInstance = req.app.get('db');
        const newMatch = req.body;
        VfcService.insertMatches(knexInstance, newMatch)
            .then(match => {
                logger.info(`match with id ${match.id} was added`)
                res
                    .status(201)
                    .json({ match })
            })
            .catch(next)
    })

vfcRouter
    .route('/characters/:userId')
    .get(bodyParser, (req, res, next) => {
        // WORKS
        // receives login (true), userId, 
        // use params for this not request body - not needed
        // need to verify auth
        const knexInstance = req.app.get('db')
        const userId = Number(req.params.userId)
        VfcService.getById(knexInstance, userId)
            .then(user => {
                if (!user) {
                    logger.error(`user with id ${userId} does not exist`)
                    return res.status(404).json({
                        error: { message: `User with id ${userId} does not have a character` }
                    })
                }
                return  VfcService.getCharacterById(knexInstance, userId)
            })
            .then(character => {
                res.status(200).json(VfcService.cleanCharacter(character))
            })
            .catch(next)
    })

module.exports = vfcRouter




