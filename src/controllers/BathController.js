const axios = require("axios");
const unzipper = require("unzipper");
const fs = require("fs");
const { default: Axios } = require("axios");
const { on } = require("process");

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

    function unzipFile() {
      fs.createReadStream("./zip/file.zip").pipe(
        unzipper.Extract({ path: "./txt/" })
      );

      // fs.unlinkSync("./zip/file.zip");

      setTimeout(function () {
        readFile();
      }, 2000);
    }

    function readFile() {
      fs.readdir("./txt", function (err, file) {
        if (err) {
          console.log("erro ao ler os dados da pasta txt: ", err);
        }

        file.forEach(function (file) {
          const data = fs.readFileSync("./txt/" + file, "utf8");

          const arr = data.split("\n");

          let response = [];

          for (let i = 1; i < arr.length - 1; i++) {
            value = {
              LAT: arr[i].split("|")[3],
              LONG: arr[i].split("|")[4],
              ADDR: arr[i].split("|")[5],
            };
            response.push(value);
          }

          res.send({
            value: response,
          });
        });
      });
    }

    async function getZipFile() {
      const path = "./zip/file.zip";
      const writer = fs.createWriteStream(path);

      const zipData = await Axios({
        url: `https://batch.geocoder.ls.hereapi.com/6.2/jobs/${response.data.Response.MetaInfo.RequestId}/result?apiKey=${process.env.API_KEY}`,
        method: "GET",
        responseType: "stream",
      });

      zipData.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on("finish", unzipFile(resolve));
        writer.on("error", reject);
      });
    }

    const StatusLoop = setInterval(async function () {
      if (status.data.Response.Status === "completed") {
        console.log(status);
        clearInterval(StatusLoop);
        getZipFile();
      } else {
        status = await axios.get(
          `https://batch.geocoder.ls.hereapi.com/6.2/jobs/${response.data.Response.MetaInfo.RequestId}?action=status&apiKey=${process.env.API_KEY}`
        );
        console.log(status);
      }
    }, 4000);
  },
};
