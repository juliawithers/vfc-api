const app = require('./app')
const PORT = process.env.PORT || 8000
const knex = require('knex')

const db = knex({
  client: 'pg',
  connection: process.env.DB_URL
})

app.set('db',db)

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`)
})