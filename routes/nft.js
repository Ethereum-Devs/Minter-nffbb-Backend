const express = require('express')

const router = express.Router()

const nftCtrl = require('../controllers/nft.js')

router.post('/create', nftCtrl.create)

module.exports = router