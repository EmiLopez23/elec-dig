import mqtt from "mqtt";
import { config } from "./config.js";
import { MongoClient } from "mongodb";

const mongoUri = 'mongodb://' + config.mongodb.hostname + ':' + config.mongodb.port + '/' + config.mongodb.database;

const client = new MongoClient(mongoUri);

async function insertData(collection,doc) {
  try {
    const database = client.db(config.mongodb.database);
    const messageCollection = database.collection(collection);

    const result = await messageCollection.insertOne(doc);

    console.log(`A document was inserted with the _id: ${result.insertedId}`);
  } catch (error) {
    console.error("Error inserting data into MongoDB:", error);
  }
}

function connectAndSubscribe() {
  const mqttUri = 'mqtt://' + config.mqtt.hostname + ':' + config.mqtt.port;
  const mqttClient = mqtt.connect(mqttUri);

  mqttClient.on("connect", () => {
    mqttClient.subscribe(["create-transaction"], (err) => {
      if (!err) {
        console.log("MQTT client connected and subscribed to all topics");
      }
    });    
  });

  mqttClient.on("message", (topic, message) => {

    insertData("transactions",{
      fecha: new Date(),
      content: message.toString()
    });

    mqttClient.publish("txn-status", message)
  });
}

async function run() {
  try {
    await client.connect(); // Connect to MongoDB
    connectAndSubscribe(); // Connect to MQTT and subscribe
  } catch (error) {
    console.error("Application error:", error);
  }
}

run();
