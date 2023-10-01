const SERVER = "product-api";
const PORT = 3000;
const HOST = "127.0.0.1";

let errors = require("restify-errors");
let restify = require("restify");

let productsSave = require("save")("products");
// Create the restify server
let server = restify.createServer({ name: SERVER });

// Initialize request counters
let getRequestCount = 0;
let postRequestCount = 0;

server.listen(PORT, HOST, function () {
  console.log(`Server ${server.name} listening to ${server.url}`);
  console.log("All the available ports:");
  console.log("/product");
  console.log("/product/:id");
  if (server.router && server.router.mounts) {
    server.router.mounts.forEach((route) => {
      console.log(
        `${route.spec.path} method: ${Object.keys(route.route.methods).join(
          ", "
        )}`
      );
    });
  }
});
