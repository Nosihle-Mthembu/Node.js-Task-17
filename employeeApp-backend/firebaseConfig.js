const admin = require("firebase-admin");
// const serviceAccount = require("./path/to/your-service-account-file.json");

admin.initializeApp({
  // credential: admin.credential.cert(serviceAccount),
  storageBucket: "your-project-id.appspot.com"
});

const db = admin.firestore();
const storage = admin.storage().bucket();
module.exports = { db, storage };
