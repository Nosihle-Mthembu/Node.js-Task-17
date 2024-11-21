// const admin = require("firebase-admin");
// // const serviceAccount = require("./serviceAccountKey.json");
// const express = require("express");
// const app = express();
// const multer = require("multer");
// const upload = multer({ storage: multer.memoryStorage() });
// const cors = require('cors');

// // Middleware to parse JSON requests
// app.use(express.json()); 


// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   storageBucket: "<process.env.bucket>.appspot.com",
// });

// const db = admin.firestore();
// const bucket = admin.storage().bucket();

// app.get("/", (req, res) => {
//     res.send("Welcome to the server and the Server is running!");
// });

// app.post("/employee", async (req, res) => {
//     const { name, email, phone, position, image } = req.body;

//     try {
//         const docRef = await db.collection('employees').add({
//             name,
//             email,
//             phone,
//             position,
//             image,
//         });
//         res.status(200).send({ id: docRef.id });
//     } catch (error) {
//         console.error("Error adding employee: ", error);
//         res.status(500).send("Error adding employee");
//     }
// });

  
  

// app.get('/employees', async (req, res) => {
//     try {
//         const snapshot = await db.collection('employees').get();
//         const employees = snapshot.docs.map(doc => doc.data());
//         res.status(200).json(employees);
//     } catch (error) {
//         console.error('Error fetching employees:', error);
//         res.status(500).send('Error fetching employees');
//     }
// });

  

// app.put("/employee/:id", async (req, res) => {
//     const { id } = req.params;
//     const employeeData = req.body;
//     try {
//       await db.collection("employees").doc(id).update(employeeData);
//       res.send({ message: "Employee updated successfully" });
//     } catch (error) {
//       res.status(500).send({ error: "Error updating employee" });
//     }
// });
  
// app.delete("/employee/:id", async (req, res) => {
//     const { id } = req.params;
//     try {
//       await db.collection("employees").doc(id).delete();
//       res.send({ message: "Employee deleted successfully" });
//     } catch (error) {
//       res.status(500).send({ error: "Error deleting employee" });
//     }
// });

// app.post('/upload', upload.single('image'), async (req, res) => {
//     const file = req.file;
//     if (!file) {
//         return res.status(400).send('No file uploaded');
//     }

//     try {
//         const bucket = admin.storage().bucket();
//         const fileUpload = bucket.file(file.originalname);
//         await fileUpload.save(fs.readFileSync(file.path), {
//             contentType: file.mimetype,
//             public: true,
//         });

//         const fileUrl = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;
//         res.status(200).send({ imageUrl: fileUrl });

//         // Optionally, delete the temp file after upload
//         fs.unlinkSync(file.path);
//     } catch (error) {
//         console.error('Error uploading to Firebase:', error);
//         res.status(500).send('Error uploading file');
//     }
// });

  

// app.listen(5000, () => {
//   console.log("Server running on port on port http://localhost:5000" );
// });

// module.exports = { db, bucket };


const express = require('express');
const admin = require('firebase-admin');
const multer = require('multer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Initialize Firebase Admin
// const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(dotenv),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

app.use(cors());
app.use(express.json());

// Verify Firebase ID Token middleware
const verifyToken = async (req, res, next) => {
  const idToken = req.headers.authorization?.split('Bearer ')[1];
  
  if (!idToken) {
    return res.status(403).json({ error: 'No token provided' });
  }
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Unauthorized' });
  }
};

// User registration route
app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    // Create user in Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email,
      password
    });
    // Create user document in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.status(201).json({ 
      message: 'User created successfully', 
      userId: userRecord.uid 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Protected route example
app.get('/api/protected-route', verifyToken, async (req, res) => {
  try {
    // Access authenticated user's UID
    const uid = req.user.uid;
    
    // Fetch user-specific data
    const userDoc = await db.collection('users').doc(uid).get();
    
    res.json({ 
      message: 'Access granted to protected route', 
      userData: userDoc.data() 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create employee (with authentication)
app.post('/api/employees', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { name, email, phone, position } = req.body;
    
    let imageUrl = '';
    if (req.file) {
      const fileName = `${Date.now()}_${req.file.originalname}`;
      const file = bucket.file(fileName);
      
      await file.save(req.file.buffer, {
        metadata: { contentType: req.file.mimetype }
      });
      
      imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    }

    const employeeData = {
      name,
      email,
      phone,
      position,
      image: imageUrl,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      userId: req.user.uid // Add user ID who created the employee
    };

    const docRef = await db.collection('employees').add(employeeData);
    res.status(201).json({ id: docRef.id, ...employeeData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all employees (with authentication)
app.get('/api/employees', verifyToken, async (req, res) => {
  try {
    const snapshot = await db.collection('employees')
      .where('userId', '==', req.user.uid) // Only fetch employees created by the authenticated user
      .orderBy('createdAt', 'desc')
      .get();
    const employees = [];
    snapshot.forEach(doc => {
      employees.push({ id: doc.id, ...doc.data() });
    });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update employee (with authentication)
app.put('/api/employees/:id', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, position } = req.body;
    
    // Verify the employee belongs to the authenticated user
    const employeeDoc = await db.collection('employees').doc(id).get();
    if (!employeeDoc.exists || employeeDoc.data().userId !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized to update this employee' });
    }
    
    let updateData = { name, email, phone, position };
    
    if (req.file) {
      const fileName = `${Date.now()}_${req.file.originalname}`;
      const file = bucket.file(fileName);
      
      await file.save(req.file.buffer, {
        metadata: { contentType: req.file.mimetype }
      });
      
      updateData.image = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      
      // Delete old image if exists
      if (employeeDoc.data().image) {
        const oldFileName = employeeDoc.data().image.split('/').pop();
        await bucket.file(oldFileName).delete().catch(() => {});
      }
    }

    await db.collection('employees').doc(id).update(updateData);
    res.json({ id, ...updateData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete employee (with authentication)
app.delete('/api/employees/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify the employee belongs to the authenticated user
    const doc = await db.collection('employees').doc(id).get();
    if (!doc.exists || doc.data().userId !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized to delete this employee' });
    }
    
    // Delete image if exists
    if (doc.data().image) {
      const fileName = doc.data().image.split('/').pop();
      await bucket.file(fileName).delete().catch(() => {});
    }
    
    await db.collection('employees').doc(id).delete();
    res.json({ id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});