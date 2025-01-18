const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 9000;
const app = express();
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
    const usersCollection = db.collection("users");

    // token related apis
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.access_token, {
        expiresIn: "1hr",
      });
      res.send({ token });
    });

    app.get("/reviews", async (req, res) => {
      const result = await reviewsCollection.find().toArray();
      res.send(result);
    });

    app.get("/menus", async (req, res) => {
      const result = await menusCollection.find().toArray();
      res.send(result);
    });

    app.get("/all-carts", async (req, res) => {
      const email = req.query.email;
      const query = { productEmail: email };
      const result = await cartsCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/carts", async (req, res) => {
      const data = req.body;
      const result = await cartsCollection.insertOne(data);
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const email = user.email;
      const query = { email: email };
      const isExist = await usersCollection.findOne(query);
      if (isExist) {
        return res.send({ message: "User already exist", insertedId: null });
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    // middleware
    const verifyToken = (req, res, next) => {
      console.log("Inside the verify token", req.headers.authorization);
      if (!req.headers.authorization) {
        return res.status(401).send({ message: "forbidden access" });
      }
      const token = req.headers.authorization.split(" ")[1];
      jwt.verify(token, process.env.access_token, (err, decoded) => {
        if (err) {
          return res.status(401).send({message: 'forbidden access'})
        }
        req.decoded = decoded
        next();
      });
    };

    app.get("/users", verifyToken, async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });

    app.patch("/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.delete("/delete-cart/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartsCollection.deleteOne(query);
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
