export const config = {
  debug: true,
  mqtt: {
    hostname: process.env.MQTT_HOSTNAME ?? "localhost",
    port: process.env.MQTT_PORT ?? 1883,
  },
  mongodb: {
    hostname: process.env.MONGODB_HOSTNAME ?? "localhost",
    port: process.env.MONGODB_PORT ?? 27017,
    database: process.env.MONGODB_DB ?? "db",
    collection: process.env.MONGODB_COLLECTION ?? "collection",
  },
};
