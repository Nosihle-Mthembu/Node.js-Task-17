require('dotenv').config();
const express = require("express");
const { db, bucket } = require("../server");
const router = express.Router();
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

router.post("/add", upload.single("photo"), async (req, res) => {
  try {
    const { name, surname, age, idNumber, role } = req.body;
    const photo = req.file;

    const employeeDoc = db.collection("employees").doc();
    await employeeDoc.set({ name, surname, age, idNumber, role });

    if (photo) {
      const blob = bucket.file(`photos/${employeeDoc.id}-${photo.originalname}`);
      const blobStream = blob.createWriteStream({ resumable: false });
      blobStream.on("finish", async () => {
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        await employeeDoc.update({ photoUrl: publicUrl });
        res.status(200).json({ id: employeeDoc.id, photoUrl: publicUrl });
      });
      blobStream.end(photo.buffer);
    } else {
      res.status(200).json({ id: employeeDoc.id });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/employee/upload/:id", upload.single("photo"), async (req, res) => {
    const { id } = req.params;
    const file = req.file;
  
    if (!file) return res.status(400).send("No file uploaded.");
  
    const blob = bucket.file(`employees/${id}/${file.originalname}`);
    const blobStream = blob.createWriteStream({
      resumable: false,
      metadata: { contentType: file.mimetype },
    });
  
    blobStream.on("finish", async () => {
      const photoURL = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      await db.collection("employees").doc(id).update({ photo: photoURL });
      res.send({ photoURL, message: "File uploaded successfully" });
    });
  
    blobStream.end(file.buffer);
  });
  


module.exports = router;
