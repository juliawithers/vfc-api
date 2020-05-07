const VfcService = {
    getAllUsers(knex) {
        // return all characters
        return knex.select('*').from('users')
    },
    getAllCharacters(knex) {
        // return all characters
        return knex.select('*').from('characters')
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
    getById(knex, id) {
        // get user by id - do I need this?
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
}

module.exports = VfcService