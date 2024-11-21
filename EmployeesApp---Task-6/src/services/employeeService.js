import axios from "axios";
const API_URL = "http://localhost:5000/api/employees";

export const addEmployee = async (employeeData) => {
  return await axios.post(`${API_URL}/add`, employeeData);
};

export const getEmployees = async () => {
  return await axios.get(API_URL);
};
