const bcrypt = require('bcryptjs')
const xss = require('xss')

const VfcService = {
    getAllUsers(knex) {
        // return all characters
        return knex.select('*').from('users')
    },
    getAllCharacters(knex) {
        // return all characters
        const characters = knex.select('*').from('characters')
        return characters
    },
    getAllMatches(knex) {
        // return all match data
        // do we need this? 
        return knex.select('*').from('matches')
    },
    insertUser(knex, newUser) {
        // insert new user data   
        return knex 
            .insert(newUser)
            .into('users')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    insertCharacter(knex, newCharacter) {
        // insert new character data
        return knex 
            .insert(newCharacter)
            .into('characters')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    insertMatches(knex, newMatch) {
        // insert new match data
        return knex 
            .insert(newMatch)
            .into('matches')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    getByUsername(knex, username) {
        return knex
            .from('users')
            .select('*')
            .where('username', username)
            .first()
    },
    getById(knex, id) {
        return knex
            .from('users')
            .select('*')
            .where('id', id)
            .first()
    },
    getIdByLogin(knex, username, passw) {
        // use user login information to get ID
        return knex
            .from('users')
            .select('*')
            .where('username', username)
            .andWhere('passw', passw)
    },
    getCharacterById(knex, user_id) {
        return knex 
            .from('characters')
            .select('*')
            .where('user_id', user_id)
            .first()
    },
    deleteUser(knex, id) {
        // delete user by id
        return knex('users')
            .where({ id })
            .delete()
    },
    deleteCharacter(knex, id) {
        // delete users character by id
        return knex('characters')
            .where({ id })
            .delete()
    },
    updateCharacter(knex, user_id, newCharacterFields) {
        // update character attributes
        return knex('characters')
            .where({ user_id })
            .update(newCharacterFields)
            
    },
    hashPassword(password) {
        return bcrypt.hash(password, 12)
    },
    comparePassword(enteredPassword, hashedPassword) {
        return bcrypt.compare(enteredPassword, hashedPassword)
    },
    cleanCharacter(character) {
        return {
            id: character.id,           
            auth: character.auth,
            username: xss(character.username),
            user_id: character.user_id,
            char_name: xss(character.char_name),
            strength: character.strength,
            intelligence: character.intelligence,
            charisma: character.charisma,
            agility: character.agility,
            current_level: character.current_level,
            current_points: character.current_points,
            wins: character.wins,
            losses: character.losses,
            attrpoints: character.attrpoints
        }
    },
    cleanUsers(user) {
        return {
            id: user.id,
            auth: user.auth,
            username: xss(user.username),
            passw: xss(user.passw),
            date_created: user.date_created
        }
    }
}

module.exports = VfcService