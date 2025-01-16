const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 9000;
const app = express();
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.db_user}:${process.env.db_pass}@cluster0.l73rt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

app.use(cors());
app.use(express.json());

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const db = client.db("bistroBoss");
    const menusCollection = db.collection("menus");
    const reviewsCollection = db.collection("reviews");
    const cartsCollection = db.collection("carts");

    app.get("/reviews", async (req, res) => {
      const result = await reviewsCollection.find().toArray();
      res.send(result);
    });

    app.get("/menus", async (req, res) => {
      const result = await menusCollection.find().toArray();
      res.send(result);
    });

    app.get("/all-carts", async (req, res) => {
      const result = await cartsCollection.find().toArray();
      res.send(result);
    });

    app.post("/carts", async (req, res) => {
      const data = req.body;
      const result = await cartsCollection.insertOne(data);
      res.send(result);
    });

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
app.listen(port);
