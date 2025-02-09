const { MongoClient } = require("mongodb");

let client;

function initializeMongoClient(username, password) {
  const uri = `mongodb://${encodeURIComponent(username)}:${encodeURIComponent(
    password
  )}@cluster0-shard-00-00.f2fsw.mongodb.net:27017,cluster0-shard-00-01.f2fsw.mongodb.net:27017,cluster0-shard-00-02.f2fsw.mongodb.net:27017/?ssl=true&replicaSet=atlas-iek3b5-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0`;
  client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

async function addUser(user) {
  if (!client) {
    throw new Error(
      "MongoClient is not initialized. Call initializeMongoClient first."
    );
  }
  await client.connect();
  const collection = client.db("event").collection("users");
  await collection.insertOne(user);
  await client.close();
}

async function findUserByUsername(username) {
  if (!client) {
    throw new Error(
      "MongoClient is not initialized. Call initializeMongoClient first."
    );
  }
  await client.connect();
  const collection = client.db("event").collection("users");
  const user = await collection.findOne({ username });
  await client.close();
  return user;
}

async function addEvent(event) {
  if (!client) {
    throw new Error(
      "MongoClient is not initialized. Call initializeMongoClient first."
    );
  }
  await client.connect();
  const collection = client.db("event").collection("events");
  await collection.insertOne(event);
  await client.close();
}

async function getEvents() {
  if (!client) {
    throw new Error(
      "MongoClient is not initialized. Call initializeMongoClient first."
    );
  }
  await client.connect();
  const collection = client.db("event").collection("events");
  const events = await collection.find().toArray();
  await client.close();
  return events;
}

async function updateEvent(id, event) {
  if (!client) {
    throw new Error(
      "MongoClient is not initialized. Call initializeMongoClient first."
    );
  }
  await client.connect();
  const collection = client.db("event").collection("events");
  await collection.updateOne(
    { _id: new MongoClient.ObjectID(id) },
    { $set: event }
  );
  await client.close();
}

async function deleteEvent(id) {
  if (!client) {
    throw new Error(
      "MongoClient is not initialized. Call initializeMongoClient first."
    );
  }
  await client.connect();
  const collection = client.db("event").collection("events");
  await collection.deleteOne({ _id: new MongoClient.ObjectID(id) });
  await client.close();
}

module.exports = {
  initializeMongoClient,
  addUser,
  findUserByUsername,
  addEvent,
  getEvents,
  updateEvent,
  deleteEvent,
};
