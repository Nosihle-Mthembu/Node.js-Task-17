const admin = require("firebase-admin");
// const serviceAccount = require("./serviceAccountKey.json");
const express = require("express");
const app = express();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const cors = require('cors');

// Middleware to parse JSON requests
app.use(express.json()); 


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "<process.env.bucket>.appspot.com",
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

app.get("/", (req, res) => {
    res.send("Welcome to the server and the Server is running!");
});

app.post("/employee", async (req, res) => {
    const { name, email, phone, position, image } = req.body;

    try {
        const docRef = await db.collection('employees').add({
            name,
            email,
            phone,
            position,
            image,
        });
        res.status(200).send({ id: docRef.id });
    } catch (error) {
        console.error("Error adding employee: ", error);
        res.status(500).send("Error adding employee");
    }
});

  
  

app.get('/employees', async (req, res) => {
    try {
        const snapshot = await db.collection('employees').get();
        const employees = snapshot.docs.map(doc => doc.data());
        res.status(200).json(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).send('Error fetching employees');
    }
});

  

app.put("/employee/:id", async (req, res) => {
    const { id } = req.params;
    const employeeData = req.body;
    try {
      await db.collection("employees").doc(id).update(employeeData);
      res.send({ message: "Employee updated successfully" });
    } catch (error) {
      res.status(500).send({ error: "Error updating employee" });
    }
});
  
app.delete("/employee/:id", async (req, res) => {
    const { id } = req.params;
    try {
      await db.collection("employees").doc(id).delete();
      res.send({ message: "Employee deleted successfully" });
    } catch (error) {
      res.status(500).send({ error: "Error deleting employee" });
    }
});

app.post('/upload', upload.single('image'), async (req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).send('No file uploaded');
    }

    try {
        const bucket = admin.storage().bucket();
        const fileUpload = bucket.file(file.originalname);
        await fileUpload.save(fs.readFileSync(file.path), {
            contentType: file.mimetype,
            public: true,
        });

        const fileUrl = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;
        res.status(200).send({ imageUrl: fileUrl });

        // Optionally, delete the temp file after upload
        fs.unlinkSync(file.path);
    } catch (error) {
        console.error('Error uploading to Firebase:', error);
        res.status(500).send('Error uploading file');
    }
});

  

app.listen(5000, () => {
  console.log("Server running on port on port http://localhost:5000" );
});

module.exports = { db, bucket };