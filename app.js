require('dotenv').config()
const express = require('express')
const axios = require('axios')

const app = express()

const port = process.env.API_PORT

app.get('/', (req, res) => {
  res.send('oi')
})

app.listen(port, () => {
  console.log('pronto', process.env.API_PORT)
})

axios.get(`https://geocode.search.hereapi.com/v1/geocode?q=Invalidenstr+117%2C+Berlin&apiKey=${process.env.API_KEY}`)
  .then(function(response){
    console.log(response.data); // ex.: { user: 'Your User'}
    console.log(response.status); // ex.: 200
  });  