// const admin = require("firebase-admin");
// require('dotenv').config();

// // const serviceAccount = require("dotenv");

// admin.initializeApp({
//   credential: admin.credential.cert(dotenv),
//   storageBucket: "your-project-id.appspot.com"
// });

// const db = admin.firestore();
// const storage = admin.storage().bucket();
// module.exports = { db, storage };

require('dotenv').config();
const admin = require("firebase-admin");
// const serviceAccount = require("./service-account-file.json");

admin.initializeApp({
  credential: admin.credential.cert(dotenv),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET
});

const db = admin.firestore();
const storage = admin.storage().bucket();
module.exports = { db, storage };
