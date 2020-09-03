const axios = require("axios");

module.exports = {
  async captureLocation(req, res, next) {
    const { street, number, city } = req.body;
    const response = await axios.get(
      `https://geocode.search.hereapi.com/v1/geocode?q=${street}+${number}+${city}&apiKey=${process.env.API_KEY}`
    );
    return res.send({
      title: response.data.items[0].title,
      address: response.data.items[0].address,
      position: response.data.items[0].position,
    });
  },
};
