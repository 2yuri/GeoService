const axios = require("axios");
const unzip = require("unzip");
const fs = require("fs");
const { default: Axios } = require("axios");

function formatValue(val) {
  const zero = "0";
  if (val.toString().length >= 4) {
    return;
  } else {
    let value = Math.abs(val.toString().length - 4);
    return zero.repeat(value);
  }
}

module.exports = {
  async captureBath(req, res, next) {
    const data = req.body;
    const array = data.infos;
    let value = "recId|searchText|country\n";

    for (let i = 0; i < array.length; i++) {
      value += `${formatValue(i + 1)}${i + 1}|${array[i].address} ${
        array[i].number
      } ${array[i].city}|${array[i].country}
        \n
        `;
    }

    const response = await axios.post(
      `https://batch.geocoder.ls.hereapi.com/6.2/jobs?apiKey=${process.env.API_KEY}&indelim=%7C&outdelim=%7C&action=run&outcols=displayLatitude,displayLongitude,locationLabel,houseNumber,street,district,city,postalCode,county,state,country&outputcombined=false`,
      value,
      {
        headers: {
          "Content-Type": "application/xml",
        },
      }
    );

    let status = await axios.get(
      `https://batch.geocoder.ls.hereapi.com/6.2/jobs/${response.data.Response.MetaInfo.RequestId}?action=status&apiKey=${process.env.API_KEY}`
    );

    async function getZipFile() {
      const path = "./zip/file.zip";
      const writer = fs.createWriteStream(path);

      const response = await Axios({
        url: `https://batch.geocoder.ls.hereapi.com/6.2/jobs/rHDqrmjVxg9wez0SD8bqlpwwaTb4xqPZ/result?apiKey=qlvZ8cXeNkYQYHdIl4__oCo440IyEy4wE3kXsQT2Hew`,
        method: "GET",
        responseType: "stream",
      });

      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on("finish", () => {
          const readstream = fs.createReadStream(path);
          const writeStream = fs.createReadStream("./txt/");

          readstream.pipe(unzip.Parse()).pipe(writeStream);
        });
        writer.on("error", reject);
      });
    }
    getZipFile();

    const StatusLoop = setInterval(async function () {
      if (status.data.Response.Status === "completed") {
        clearInterval(StatusLoop);
        getZipFile();
      } else {
        status = await axios.get(
          `https://batch.geocoder.ls.hereapi.com/6.2/jobs/${response.data.Response.MetaInfo.RequestId}?action=status&apiKey=${process.env.API_KEY}`
        );
      }
    }, 4000);
  },
};

// fs.unlinkSync("./zip/file.zip");
