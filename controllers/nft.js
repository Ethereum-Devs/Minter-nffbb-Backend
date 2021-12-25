const nftService = require('../services/nft')

const create = async (req, res, next) => {
  const { pdf, title, author, description, image, artist, genre, language, qty } = req.body
  const metadataURL = await nftService.create(pdf, title, author, description, image, artist, genre, language, qty)
  res.json({ status: 'success', metadataURL })
}

module.exports = {
  create
}