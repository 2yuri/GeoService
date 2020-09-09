const axios = require("axios");

module.exports = {
  async captureLocation(req, res, next) {
    const { street, number, city, province, country } = req.body;
    const response = await axios.get(
      `https://geocode.search.hereapi.com/v1/geocode?q=${street}+${number}+${city}+${province}+${country}&apiKey=${process.env.API_KEY}`
    );
    return res.send({
      result:
        response.data.items[0].address.street ||
        response.data.items[0].address.houseNumber
          ? 200
          : 404,
      infos:
        response.data.items[0].address.street ||
        response.data.items[0].address.houseNumber
          ? {
              addressFormated: response.data.items[0].title,
              addressInformation: {
                street: response.data.items[0].address.street,
                number: response.data.items[0].address.houseNumber,
                district: response.data.items[0].address.district,
                city: response.data.items[0].address.city,
                province: response.data.items[0].address.state,
                ZIP: response.data.items[0].address.postalCode,
                country: response.data.items[0].address.countryName,
              },
              geoInformation: response.data.items[0].position,
            }
          : "Nenhum dado encontrado!",
    });
  },
};
