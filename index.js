import mqtt from "mqtt";
import { config } from "./config.js";
import { MongoClient } from "mongodb";

const mongoUri = 'mongodb://' + config.mongodb.hostname + ':' + config.mongodb.port + '/' + config.mongodb.database;

const client = new MongoClient(mongoUri);

async function insertData(doc) {
  try {
    const database = client.db(config.mongodb.database);
    const messageCollection = database.collection("message");

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
    mqttClient.subscribe("#", (err) => {
      if (!err) {
        console.log("MQTT client connected and subscribed to all topics");
      }
    });

    const database = client.db(config.mongodb.database);
    const messageCollection = database.collection("message");
    const messages = async() => await messageCollection.find({}).toArray();

    setInterval(async() => {
      console.log("Publishing message from db");
      const messages = await messageCollection.find({}).toArray();
      const messageString = JSON.stringify(messages);
      mqttClient.publish("fromDB", messageString);
    }, 5000);
    
  });

  mqttClient.on("message", (topic, message) => {
    // Message received from MQTT
    console.log("MQTT Message:", message.toString());

    // Insert the MQTT message into MongoDB
    insertData({
      fecha: new Date(),
      content: message.toString()
    });
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
