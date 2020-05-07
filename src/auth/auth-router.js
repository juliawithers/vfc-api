const express = require('express')

const authRouter = express.Router()
const jsonBodyParser = express.json()

authRouter
  .post('/login',jsonBodyParser, (req, res, next) => {
      const { username, passw } = req.body
      const loginUser = { username, passw }

      for (const[key, value] of Object.entries(loginUser)){
         if (value === null) {
            return res.status(400).json({
                error: `missing '${key} in request body`
            })
         }
      }
        
    res.send('ok')
  })

module.exports = authRouter