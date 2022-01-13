const FormData = require('form-data')
const axios = require('axios')

const { fromString } = require('uint8arrays/from-string')
const { ipfsFileApiUrl, ipfsGateUrl, pinataApiKey, pinataSecretKey, openseaUrl } = require('../config');
const { generateBookFromTemplate } = require('./toHtml')

const create = async (pdf, title, author, description, image, artist, genre, language, qty) => {
  // const ipfs = ipfsClient(ipfsApiUrl)
  const removeLen = pdf.indexOf('base64') + 7
  const pdfData = fromString(pdf.substr(removeLen, pdf.length - removeLen), 'base64')
  const imgRemoveLen = image.indexOf('base64') + 7
  const imageData = fromString(image.substr(imgRemoveLen, image.length - imgRemoveLen), 'base64')

  try {
    const pdfCID = await pinFileToIPFS(pdfData, title + '.pdf')
    const imageCID = await pinFileToIPFS(imageData, title + '.png')

    const options = {
      title: title,
      image: `${ipfsGateUrl}/${imageCID}`,
      authorTwitter: `page_dao`,
      pdfURL: `${ipfsGateUrl}/${pdfCID}`,
      purchaseURL: `${openseaUrl}`
    }

    const htmlBook = fromString(generateBookFromTemplate(options))
    const htmlCID = await pinFileToIPFS(htmlBook, title + '.html')

    const metadata = {
      name: title,
      edition: 1,
      description: description,
      seller_fee_basis_points: 500,
      image: `${ipfsGateUrl}/${imageCID}`,
      interactive_url: `${ipfsGateUrl}/${htmlCID}`,
      animation_url: `${ipfsGateUrl}/${htmlCID}`,
      attributes: [
        {
          "trait_type": "Author(s)",
          "value": author
        },
        {
          "trait_type": "Artist(s)",
          "value": artist
        },
        {
          "trait_type": "Genre",
          "value": genre
        },
        {
          "trait_type": "Language",
          "value": language
        },
        {
          "trait_type": "Quantity",
          "value": qty
        }
      ],
      properties: {
        //don't remove files property. I need to use it later.
        files: {
          uri: `${ipfsGateUrl}/${pdfCID}`
        },
        author: author,
        artist: artist,
        genre: genre,
        language: language,
        qty: qty
      }
    }
    try {
      const cid = await pinFileToIPFS(JSON.stringify(metadata), title + '.json')
      return `${ipfsGateUrl}/${cid}`
    } catch (err) {
      console.log('error:', err)
    }

  } catch (err) {
    console.log('error:', err)
  }
}

const pinFileToIPFS = async (file, filename) => {
  try {
    let data = new FormData();
    data.append('file', Buffer.from(file), filename);
    // console.log('data', data);
    const res = await axios.post(ipfsFileApiUrl,
      data,
      {
        headers: {
          'Content-Type': `multipart/form-data; boundary= ${data._boundary}`,
          'pinata_api_key': pinataApiKey,
          'pinata_secret_api_key': pinataSecretKey
        },

        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );
    return res.data.IpfsHash;
  }
  catch (error) {
    console.log('error', error);
    return null;
  }
};

module.exports = {
  create
}