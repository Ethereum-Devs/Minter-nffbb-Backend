const FormData = require('form-data')
const axios = require('axios')

const { fromString } = require('uint8arrays/from-string')
const { ipfsFileApiUrl, ipfsGateUrl, pinataApiKey, pinataSecretKey } = require('../config');

const create = async (pdf, title, author, description, image, artist, genre, language, qty) => {
  // const ipfs = ipfsClient(ipfsApiUrl)
  const removeLen = pdf.indexOf('base64') + 7
  const pdfData = fromString(pdf.substr(removeLen, pdf.length - removeLen), 'base64')
  const imgRemoveLen = image.indexOf('base64') + 7
  const imageData = fromString(image.substr(imgRemoveLen, image.length - imgRemoveLen), 'base64')

  try {
    const pdfCID = await pinFileToIPFS(pdfData)
    const imageCID = await pinFileToIPFS(imageData)
    const metadata = {
      name: title,
      edition: 1,
      description: description,
      seller_fee_basis_points: 500,
      image: `${ipfsGateUrl}/${imageCID}`,
      attributes: [],
      properties: {
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
      const cid = await pinFileToIPFS(JSON.stringify(metadata))
      return `${ipfsGateUrl}/${cid}`
    } catch (err) {
      console.log('error:', err)
    }

  } catch (err) {
    console.log('error:', err)
  }
}

const pinFileToIPFS = async (file) => {
  try {
    let data = new FormData();
    data.append('file', Buffer.from(file), 'newNft.png');
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