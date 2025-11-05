import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const getMachines = async () => {
  const response = await axios.get(`${API_URL}/machines`);
  return response.data;
};

export const getMachineById = async (id) => {
  const response = await axios.get(`${API_URL}/machines/${id}`);
  return response.data;
};

export const addMachine = async (data) => {
  const response = await axios.post(`${API_URL}/machines`, data);
  return response.data;
};

export const updateMachine = async (id, data) => {
  const response = await axios.put(`${API_URL}/machines/${id}`, data);
  return response.data;
};

export const deleteMachine = async (id) => {
  const response = await axios.delete(`${API_URL}/machines/${id}`);
  return response.data;
};