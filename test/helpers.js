// cleanTables 
function cleanTables(db) {
    return db.raw(
      `TRUNCATE
        users,
        characters,
        matches
        RESTART IDENTITY CASCADE`
    )
  }
// makeUsersFixtures
function makeUsersFixtures() {
    return [
      {
        id: 1,
        username: 'test-user-1',
        password: 'password1!',
        date_created: '2029-01-22T16:28:32.615Z',
      },
      {
        id: 2,
        username: 'test-user-2',
        passw: 'password2!',
        date_created: '2029-01-22T16:28:32.615Z',
      },
      {
        id: 3,
        username: 'test-user-3',
        passw: 'password3!',
        date_created: '2029-01-22T16:28:32.615Z',
      },
      {
        id: 4,
        username: 'test-user-4',
        passw: 'password4!',
        date_created: '2029-01-22T16:28:32.615Z',
      },
    ]
  }
  
// seedUsers
function seedUsers(db, users, things, reviews=[]) {
    return db
      .into('users')
      .insert(users)
  }
// makeAuthHeaders
function makeAuthHeaders(user, secret = process.env.JWT_SECRET) {
    const token = jwt.sign({ user_id: user.id}, secret, {
        subject: user.username,
        algorithm: 'HS256',
    })
    return `Bearer ${token}`
}

module.exports = {
    cleanTables,
    makeUsersFixtures,
    seedUsers,
    makeAuthHeaders
}