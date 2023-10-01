const SERVER = "product-api";
const PORT = 5000;
const HOST = "127.0.0.1";

let errors = require("restify-errors");
let restify = require("restify");

let productData = require("save")("products");
// Create the restify server
let server = restify.createServer({ name: SERVER });

// Initialize request counters
let getRequestCount = 0;
let postRequestCount = 0;

server.listen(PORT, HOST, function () {
  //showing the initializaion in the terminal
  console.log(`Server ${server.name} listening at ${server.url}`);
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

///plugin of restidy for parsing all the body
server.use(restify.plugins.fullResponse());
server.use(restify.plugins.bodyParser());

// Middleware for displaying get request and post request count
server.use(function (req, res, next) {
  console.log(`${req.route.path} ${req.method}: received request`);
  // Update counters
  if (req.method === "GET") {
    getRequestCount++;
  } else if (req.method === "POST") {
    postRequestCount++;
  }
  console.log(
    `Processed Request Count has => Get: ${getRequestCount}, Post: ${postRequestCount}`
  );

  res.once("finish", function () {
    console.log(`${req.route.path} ${req.method}: sending response`);
  });
  next();
});

// Sample product data (initially empty)
let productList = [];

// POST Request -> for creating new products
server.post("/products", function (req, res, next) {
  // Validation of mandatory fields
  if (
    req.body.name === undefined ||
    req.body.price === undefined ||
    req.body.quantity === undefined
  ) {
    // If there are any errors, pass them to next in the correct format
    return next(
      new errors.BadRequestError("Name, Price, and Quantity must be inserted")
    );
  }

  let newProduct = {
    name: req.body.name,
    price: req.body.price,
    quantity: req.body.quantity,
  };

  //creating new data
  productData.create(newProduct, function (error, product) {
    // If there are any errors, pass them to next in the correct format
    if (error) return next(new Error(JSON.stringify(error.errors)));

    // Send the product if no issues
    res.send(201, product);
  });
});

// GET request -> for getting all the products
server.get("/products", function (req, res, next) {
  productData.find({}, function (error, products) {
    // Return all the products
    res.send(products);
  });
});

// GET request for getting product by its id
server.get("/products/:_id", function (req, res, next) {
  productData.findOne({ _id: req.params._id }, function (error, product) {
    // If there are any errors, pass them to next in the correct format
    if (error) return next(new Error(JSON.stringify(error.errors)));

    if (product) {
      // return the product
      res.send(product);
    } else {
      // Send 404 header if the product doesn't exist
      res.send(404);
    }
  });
});

// DELETE request deleting by its id

// DELETE: Delete a product by its ID
server.del("/products/:id", function (req, res, next) {
  // Delete the product
  productData.delete(req.params.id, function (error, product) {
    // If there are any errors, pass them to next in the correct format
    if (error) return next(new Error(JSON.stringify(error.errors)));
    // Send a 204 response (No Content) if successful
    res.send(204);
  });

  // DELETE: Delete all products
  server.del("/products", function (req, res, next) {
    // Delete all products
    productData.delete({}, function (error) {
      // If there are any errors, pass them to next in the correct format
      if (error) {
        console.error(
          `Error in DELETE /products: ${JSON.stringify(error.errors)}`
        );
        return next(new Error(JSON.stringify(error.errors)));
      }
      res.send(204);
    });
  });
});
