const axios = require("axios");
const unzipper = require("unzipper");
const fs = require("fs");
const { default: Axios } = require("axios");

let finalResponse = [];

module.exports = {
  async captureBatch(req, res, next) {
    res.status(404).send("Url não encontrada");
    process.exit();
    const data = req.body;
    const array = data.infos;
    let value = "recId|searchText|country\n";

    for (let i = 0; i < array.length; i++) {
      console.log(
        `${array[i].id}|${array[i].address} ${array[i].number}, ${array[i].city} ${array[i].province}|${array[i].country}`
      );
      value += `${array[i].id}|${array[i].address} ${array[i].number}, ${array[i].city} ${array[i].province}|${array[i].country}\n`;
    }

    const response = await axios.post(
      `https://batch.geocoder.ls.hereapi.com/6.2/jobs?apiKey=${process.env.API_KEY}&indelim=%7C&outdelim=%7C&action=run&outcols=displayLatitude,displayLongitude,locationLabel,houseNumber,street,district,city,postalCode,county,state,country&outputcombined=true`,
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

      setTimeout(function () {
        fs.unlinkSync("./zip/file.zip");
        readFile();
      }, 10000);
    }

    function readFile() {
      fs.readdir("./txt", function (err, file) {
        if (err) {
          console.log("erro ao ler os dados da pasta txt: ", err);
        }

        file.forEach(function (file) {
          const data = fs.readFileSync("./txt/" + file, "utf8");

          const arr = data.split("\n");

          for (let i = 1; i < arr.length - 1; i++) {
            value = {
              id: arr[i].split("|")[0],
              addressFormated: arr[i].split("|")[5],
              addresInformation: {
                street: arr[i].split("|")[7],
                number: arr[i].split("|")[6],
                district: arr[i].split("|")[8],
                city: arr[i].split("|")[9],
                province: arr[i].split("|")[12],
                ZIP: arr[i].split("|")[10],
                country: arr[i].split("|")[11],
              },
              geoInformation: {
                lat: arr[i].split("|")[3],
                lng: arr[i].split("|")[4],
              },
            };
            finalResponse.push(value);
          }
          res.send({
            value: finalResponse,
          });

          fs.unlinkSync("./txt/" + file);
        });
      });
    }

    async function getZipFile() {
      await axios
        .get(
          `https://batch.geocoder.ls.hereapi.com/6.2/jobs/${response.data.Response.MetaInfo.RequestId}/result?apiKey=${process.env.API_KEY}`,
          { responseType: "stream" }
        )
        .then((result) => {
          result.data.pipe(fs.createWriteStream("./zip/file.zip"));

          setTimeout(function () {
            unzipFile();
          }, 5000);
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
    }, 5000);
  },
};
