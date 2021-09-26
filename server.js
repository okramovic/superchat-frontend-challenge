"use strict";
require("dotenv").config();
const express = require("express"),
  path = require("path"),
  app = express();
const port = process.env.PORT || 3001;
const staticFilesFolder = "build";

const MongoClient = require("mongodb").MongoClient;
const { ObjectId } = require("mongodb");
const mongoURI = `mongodb+srv://${process.env.USERNAME}:${process.env.PASS}@cluster0.mcoai.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const mongoClient = new MongoClient(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.json());
app.use(express.static(path.join(__dirname, staticFilesFolder)));

app.post("/create-entry", async (req, res) => {
  try {
    const collection = await mongoClient.db("superchat").collection("repos");
    const result = await collection.insertOne(req.body);

    if (result.insertedId) {
      const newId = result.insertedId
        .toString()
        .replace(/^new ObjectId\("/, "")
        .replace(/"\)$/, "");
      res.status(201).send({ newId });
    } else res.sendStatus(500);
  } catch (e) {
    console.error("error creating db entry\n", e);
    res.status(500);
  }
});

app.get("/repo/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const collection = await mongoClient.db("superchat").collection("repos");
    const result = await collection.findOne({ _id: ObjectId(id) });
    res.send(result);
  } catch (e) {
    console.error("error getting db entry\n", e);
    res.status(500);
  }
});

app.get("/r/:id", async (req, res) => {
  res.sendFile(path.join(__dirname, staticFilesFolder, "index.html"));
});

app.get("/*", (_, res) => {
  res.sendFile(path.join(__dirname, staticFilesFolder, "index.html"));
});

app.listen(port, () => {
  console.log(`The application is listening on port ${port}`);
  mongoClient.connect();
});
