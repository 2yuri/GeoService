// index de controllers
module.exports = require("require-all")({
  dirname: `${__dirname}`,
  filter: (i) => (i !== "index.js" && i.split(".")[0]) || false,
});
