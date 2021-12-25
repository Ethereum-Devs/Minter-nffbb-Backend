const express = require('express')
const bodyParser = require('body-parser')
const dotenv = require('dotenv')
const cors = require('cors')
Promise = require('bluebird');

const routes = require('./routes');

dotenv.config()
const app = express()

app.use(cors())
app.use(bodyParser.json({ limit: '50mb' }));
app.use('/api', routes)

// app.use(express.static(`${__dirname}/build`))

// app.use('/*', (req, res) => {
//   res.sendFile(`${__dirname}/build/index.html`)
// })

const port = process.env.PORT

app.listen(port, () => {
  console.info(`server started on port ${port}`); // eslint-disable-line no-console
});