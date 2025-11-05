import React, { useState, useEffect } from 'react';
import { getMachines } from './api';
import './App.css';

function App() {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    try {
      setLoading(true);
      const data = await getMachines();
      setMachines(data);
      setLoading(false);
    } catch (err) {
      setError('Error fetching data');
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="App">
      <h1>Predictive Maintenance Dashboard</h1>
      <p>Total Machines: {machines.length}</p>
      
      <table>
        <thead>
          <tr>
            <th>Product ID</th>
            <th>Type</th>
            <th>Air Temperature</th>
            <th>Process Temperature</th>
            <th>Rotational Speed</th>
            <th>Torque</th>
          </tr>
        </thead>
        <tbody>
          {machines.map((machine, index) => (
            <tr key={index}>
              <td>{machine['Product ID'] || machine.productId}</td>
              <td>{machine['Type'] || machine.type}</td>
              <td>{machine['Air temperature [K]'] || machine.airTemp}</td>
              <td>{machine['Process temperature [K]'] || machine.processTemp}</td>
              <td>{machine['Rotational speed [rpm]'] || machine.rotationalSpeed}</td>
              <td>{machine['Torque [Nm]'] || machine.torque}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;