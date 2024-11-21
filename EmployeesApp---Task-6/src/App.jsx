// import { useEffect, useState } from 'react';
// import axios from 'axios'; 
// import './App.css';

// const App = () => {
//     const [employees, setEmployees] = useState(() => {
//         const savedEmployees = localStorage.getItem("employees");
//         return savedEmployees ? JSON.parse(savedEmployees) : [];
//     });

//     const [searchTerm, setSearchTerm] = useState("");
//     const [form, setForm] = useState({
//         name: "",
//         email: "",
//         phone: "",
//         image: "",
//         position: "",
//         id: ""
//     });

//     const [isEditing, setIsEditing] = useState(false);
//     const [imageFile, setImageFile] = useState(null);  // For image file

//     useEffect(() => {
//         const fetchEmployees = async () => {
//             try {
//                 const response = await axios.get('http://localhost:5000/employees');
//                 setEmployees(response.data);
//             } catch (error) {
//                 console.error('Error fetching employees:', error);
//             }
//         };

//         fetchEmployees();
//     }, []);

//     const handleSearchChange = (e) => {
//         setSearchTerm(e.target.value);
//     };

//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setForm({ ...form, [name]: value });
//     };

//     const handleFileChange = (e) => {
//         const file = e.target.files[0];
//         setImageFile(file);
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
        
//         let imageUrl = form.image;
        
//         // If there's a file, upload it to Firebase or your backend
//         if (imageFile) {
//             const formData = new FormData();
//             formData.append('image', imageFile);
            
//             try {
//                 const response = await axios.post('http://localhost:5000/upload', formData, { 
//                     headers: { 'Content-Type': 'multipart/form-data' }
//                 });
//                 imageUrl = response.data.imageUrl; // Image URL returned from backend
//             } catch (error) {
//                 console.error('Error uploading image:', error);
//             }
//         }

//         const newEmployee = { ...form, image: imageUrl, id: Date.now().toString() };

//         if (isEditing) {
//             setEmployees(employees.map(employee => 
//                 employee.id === form.id ? newEmployee : employee
//             ));
//             setIsEditing(false);
//         } else {
//             setEmployees([...employees, newEmployee]);
//         }

//         setForm({ name: "", email: "", phone: "", image: "", position: "", id: "" });
//         setImageFile(null); // Reset the file input
//     };

//     const handleDelete = (id) => {
//         setEmployees(employees.filter(employee => employee.id !== id));
//     };

//     const handleEdit = (employee) => {
//         setForm(employee);
//         setIsEditing(true);
//     };

//     const filteredEmployees = employees.filter(employee =>
//         employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         employee.phone.includes(searchTerm)
//     );

//     return (
//         <div className="container">
//             <main className="main">
//                 <section className="section">
//                     <div className="header">
//                         <div>
//                             <h1>Employee App</h1>
//                             <p>A beautiful place to start your day by knowing your co-workers</p>
//                         </div>
//                     </div>
//                     <div className="search-bar">
//                         <input 
//                             type="text" 
//                             placeholder="Search..." 
//                             value={searchTerm} 
//                             onChange={handleSearchChange} 
//                         />
//                         <button style={{backgroundColor:"lightblue"}}>Submit</button>
//                     </div>
//                     <div className="grid">
//                         <div className="assistant">
//                             <div className="header">
//                                 <div className="icon">
//                                     <i className="fas fa-robot"></i>
//                                 </div>
//                                 <h1>Registration Form</h1>
//                             </div>
//                             <form onSubmit={handleSubmit}>
//                                 <div>
//                                     <label>Name and Surname</label>
//                                     <input 
//                                         type="text" 
//                                         name="name" 
//                                         value={form.name} 
//                                         onChange={handleInputChange} 
//                                         required 
//                                     />
//                                 </div>
//                                 <div>
//                                     <label>Email Address</label>
//                                     <input 
//                                         type="email" 
//                                         name="email" 
//                                         value={form.email} 
//                                         onChange={handleInputChange} 
//                                         required 
//                                     />
//                                 </div>
//                                 <div>
//                                     <label>Phone Number</label>
//                                     <input 
//                                         type="tel" 
//                                         name="phone" 
//                                         value={form.phone} 
//                                         onChange={handleInputChange} 
//                                         required 
//                                     />
//                                 </div>
//                                 <div>
//                                     <label>Image URL</label>
//                                     <input 
//                                         type="url" 
//                                         name="image" 
//                                         value={form.image} 
//                                         onChange={handleInputChange} 
//                                         required 
//                                     />
//                                 </div>
//                                 <div>
//                                     <label>Employee Position</label>
//                                     <input 
//                                         type="text" 
//                                         name="position" 
//                                         value={form.position} 
//                                         onChange={handleInputChange} 
//                                         required 
//                                     />
//                                 </div>
//                                 <div>
//                                     <button style={{backgroundColor:"lightblue"}} type="submit">{isEditing ? 'Update' : 'Submit'}</button>
//                                 </div>
//                             </form>
//                         </div>
//                         <div className="info-container">
//                             <ul>
//                                 {filteredEmployees.length > 0 ? (
//                                     filteredEmployees.map(employee => (
//                                         <li key={employee.id}>
//                                             <img src={employee.image} alt={employee.name} style={{ width: "50px", height: "50px", borderRadius: "50%" }} />
//                                             <span className="value">{employee.name}</span>
//                                             <span className="label">{employee.position}</span>
//                                             <span className="label">{employee.email}</span>
//                                             <span className="label">{employee.phone}</span>
//                                             <button onClick={() => handleEdit(employee)} style={{backgroundColor:"lightblue"}}>Edit</button>
//                                             <button onClick={() => handleDelete(employee.id)} style={{backgroundColor:"red"}}>Delete</button>
//                                         </li>
//                                     ))
//                                 ) : (
//                                     <li>No employees found</li>
//                                 )}
//                             </ul>
//                         </div>
//                     </div>
//                 </section>
//             </main>
//         </div>
//     );
// };

// export default App;


import { useEffect, useState } from 'react';


const API_URL = 'http://localhost:5000/api';

const App = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {  
    try {  
     const response = await fetch(`${API_URL}/employees`);  
     const data = await response.json();  
     setEmployees(data);  
    } catch (error) {  
     console.error('Error fetching employees:', error);  
     if (error.response) {  
      console.error('Error response:', error.response);  
     }  
    }  
  };
  
  
  
  

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    Object.keys(form).forEach(key => {
      formData.append(key, form[key]);
    });
    if (selectedImage) {
      formData.append('image', selectedImage);
    }

    try {
      if (isEditing) {
        const response = await fetch(`${API_URL}/employees/${currentId}`, {
          method: 'PUT',
          body: formData,
        });
        await response.json();
      } else {
        const response = await fetch(`${API_URL}/employees`, {
          method: 'POST',
          body: formData,
        });
        await response.json();
      }
      
      fetchEmployees();
      resetForm();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_URL}/employees/${id}`, {
        method: 'DELETE',
      });
      fetchEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };

  const handleEdit = (employee) => {
    setForm({
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      position: employee.position,
    });
    setCurrentId(employee.id);
    setIsEditing(true);
  };

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      phone: "",
      position: "",
    });
    setSelectedImage(null);
    setIsEditing(false);
    setCurrentId(null);
  };

  const filteredEmployees = Array.isArray(employees) ? employees.filter(employee =>  
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||  
    employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||  
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||  
    employee.phone.includes(searchTerm)  
  ) : [];
  

  return (
    <div className="container">
      <main className="main">
        <section className="section">
          <div className="header">
            <div>
              <h1>Employee App</h1>
              <p>A beautiful place to start your day by knowing your co-workers</p>
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
                  <label>Employee Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    required={!isEditing}
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
                  {isEditing && (
                    <button
                      style={{backgroundColor:"gray", marginLeft: "10px"}}
                      type="button"
                      onClick={resetForm}
                    >
                      Cancel
                    </button>
                  )}
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