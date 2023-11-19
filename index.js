require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

const cors = require("cors");

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@onlinegroupstudy.c4hijlq.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)

    const database = client.db("assignmentDB");
    const userCollection = database.collection("assignments");

    //   app.get("/products", async (req, res) => {
    //     let query = {};
    //     if (req.query?.email) {
    //       query = { email: req.query.email };
    //     }
    //     const cursor = userCollection.find(query);
    //     const result = await cursor.toArray();
    //     res.send(result);
    //   });

    //   app.post("/products", async (req, res) => {
    //     const product = req.body;
    //     const result = await userCollection.insertOne(product);
    //     res.send(result);
    //     console.log(product);
    //   });

    //   app.delete("/products/:id", async (req, res) => {
    //     const id = req.params.id;
    //     const query = { _id: new ObjectId(id) };
    //     const result = await userCollection.deleteOne(query);
    //     res.send(result);
    //   });

    //   app.put("/products/:id", async (req, res) => {
    //     const id = req.params.id;
    //     const filter = { _id: new ObjectId(id) };
    //     const options = { upsert: true };
    //     const updateProduct = req.body;
    //     const product = {
    //       $set: {
    //         image: updateProduct.image,
    //         name: updateProduct.name,
    //         brand: updateProduct.brand,
    //         type: updateProduct.type,
    //         price: updateProduct.price,
    //         rating: updateProduct.rating,
    //       },
    //     };

    //     try {
    //       const result = await userCollection.updateOne(filter, product, options);
    //       res.send(result);
    //     } catch (error) {
    //       console.error("Error updating product:", error);
    //       res.status(500).send("Internal Server Error");
    //     }
    //   });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
