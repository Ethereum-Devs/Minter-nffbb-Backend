const express = require('express')

const router = express.Router()
const nftRoutes = require('./nft')

router.get('/health-check', (req, res) =>
  res.send('OK')
)

router.use('/nft', nftRoutes)

module.exports = router;