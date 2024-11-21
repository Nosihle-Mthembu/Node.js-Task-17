import { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
require("dotenv").config
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';


// Replace with your Firebase config
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};

initializeApp(firebaseConfig);
const auth = getAuth();

const App = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    image: "",
    position: "",
    id: ""
  });
  const [isEditing, setIsEditing] = useState(false);
  
  // Authentication states
  const [user, setUser] = useState(null);
  const [authForm, setAuthForm] = useState({
    email: "",
    password: ""
  });
  const [authError, setAuthError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        localStorage.setItem("employees", JSON.stringify(employees));
      }
    });

    return () => unsubscribe();
  }, [employees]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleAuthInputChange = (e) => {
    const { name, value } = e.target;
    setAuthForm({ ...authForm, [name]: value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, authForm.email, authForm.password);
      setAuthError("");
      setAuthForm({ email: "", password: "" });
    } catch (error) {
      setAuthError(error.message);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, authForm.email, authForm.password);
      setAuthError("");
      setAuthForm({ email: "", password: "" });
    } catch (error) {
      setAuthError(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setEmployees([]);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      setEmployees(employees.map(employee =>
        employee.id === form.id ? form : employee
      ));
      setIsEditing(false);
    } else {
      const newEmployee = { ...form, id: Date.now().toString() };
      setEmployees([...employees, newEmployee]);
    }
    setForm({ name: "", email: "", phone: "", image: "", position: "", id: "" });
  };

  const handleDelete = (id) => {
    setEmployees(employees.filter(employee => employee.id !== id));
  };

  const handleEdit = (employee) => {
    setForm(employee);
    setIsEditing(true);
  };

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.phone.includes(searchTerm)
  );

  if (!user) {
    return (
      <div className="container">
        <main className="main">
          <section className="section">
            <div className="auth-container">
              <h2>{isRegistering ? 'Register' : 'Login'}</h2>
              {authError && <div className="error-message">{authError}</div>}
              <form onSubmit={isRegistering ? handleSignup : handleLogin} className="auth-form">
                <div>
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={authForm.email}
                    onChange={handleAuthInputChange}
                    required
                  />
                </div>
                <div>
                  <label>Password</label>
                  <input
                    type="password"
                    name="password"
                    value={authForm.password}
                    onChange={handleAuthInputChange}
                    required
                  />
                </div>
                <div className="auth-buttons">
                  <button type="submit" style={{backgroundColor: "lightblue"}}>
                    {isRegistering ? 'Register' : 'Login'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsRegistering(!isRegistering)}
                    style={{backgroundColor: "lightgreen"}}
                  >
                    {isRegistering ? 'Switch to Login' : 'Switch to Register'}
                  </button>
                </div>
              </form>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="container">
      <main className="main">
        <section className="section">
          <div className="header">
            <div>
              <h1>Employee App</h1>
              <p>A beautiful place to start your day by knowing your co-workers</p>
              <div className="user-info">
                <span>Logged in as: {user.email}</span>
                <button onClick={handleLogout} style={{backgroundColor: "red", marginLeft: "10px"}}>
                  Logout
                </button>
              </div>
            </div>
          </div>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="grid">
            <div className="assistant">
              <div className="header">
                <div className="icon">
                  <i className="fas fa-robot"></i>
                </div>
                <h1>Registration Form</h1>
              </div>
              <form onSubmit={handleSubmit}>
                <div>
                  <label>Name and Surname</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label>Image URL</label>
                  <input
                    type="url"
                    name="image"
                    value={form.image}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label>Employee Position</label>
                  <input
                    type="text"
                    name="position"
                    value={form.position}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <button style={{backgroundColor:"lightblue"}} type="submit">
                    {isEditing ? 'Update' : 'Submit'}
                  </button>
                </div>
              </form>
            </div>
            <div className="info-container">
              <ul>
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map(employee => (
                    <li key={employee.id}>
                      <img 
                        src={employee.image} 
                        alt={employee.name} 
                        style={{ width: "50px", height: "50px", borderRadius: "50%" }} 
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/50';
                        }}
                      />
                      <span className="value">{employee.name}</span>
                      <span className="label">{employee.position}</span>
                      <span className="label">{employee.email}</span>
                      <span className="label">{employee.phone}</span>
                      <button onClick={() => handleEdit(employee)} style={{backgroundColor:"lightblue"}}>Edit</button>
                      <button onClick={() => handleDelete(employee.id)} style={{backgroundColor:"red"}}>Delete</button>
                    </li>
                  ))
                ) : (
                  <li>No employees found</li>
                )}
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;