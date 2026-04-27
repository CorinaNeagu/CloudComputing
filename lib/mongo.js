import { MongoClient } from "mongodb";

if (!process.env.NEXT_ATLAS_URI) {
  throw new Error('Adaugă NEXT_ATLAS_URI în .env');
}

const uri = process.env.NEXT_ATLAS_URI;
const options = {};

let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  // În dezvoltare, folosim o variabilă globală pentru a nu epuiza conexiunile la MongoDB Atlas
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // În producție, e mai bine să nu folosim o variabilă globală
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// 1. Exportul DEFAULT necesar pentru NextAuth (Eroarea ta de acum)
export default clientPromise;

// 2. Funcția ta pentru a lua colecții (pentru afișarea pisicilor)
export async function getCollection(collectionName) {
  const client = await clientPromise;
  const db = client.db(process.env.NEXT_ATLAS_DATABASE);
  return db.collection(collectionName);
}