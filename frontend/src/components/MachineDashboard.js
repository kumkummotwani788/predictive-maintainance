import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import { Refresh as RefreshIcon, TableChart as TableChartIcon } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { getMachines, runMachineSimulation } from '../api';

const LOCATION_OPTIONS = [
  'Plant Alpha - Detroit',
  'Plant Beta - Austin',
  'Plant Gamma - Berlin',
  'Plant Delta - Tokyo',
  'Plant Epsilon - São Paulo'
];

const deriveLocation = (machineId) => {
  if (!machineId) return 'Unknown';
  const sum = machineId
    .toString()
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return LOCATION_OPTIONS[sum % LOCATION_OPTIONS.length];
};

const MachineDashboard = () => {
  const [allMachines, setAllMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusMap, setStatusMap] = useState({});
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState(null);
  const userRole = localStorage.getItem('role');

  const filterMachinesByRole = useCallback(
    (data) => {
      switch (userRole) {
        case 'admin':
          return data;
        case 'opH':
          return data.filter(
            (machine) =>
              machine['Type'] === 'H' ||
              machine.type === 'H' ||
              machine.Type === 'H'
          );
        case 'opM':
          return data.filter(
            (machine) =>
              machine['Type'] === 'M' ||
              machine.type === 'M' ||
              machine.Type === 'M'
          );
        case 'opL':
          return data.filter(
            (machine) =>
              machine['Type'] === 'L' ||
              machine.type === 'L' ||
              machine.Type === 'L'
          );
        default:
          return [];
      }
    },
    [userRole]
  );

  const roleScopedMachines = useMemo(
    () => filterMachinesByRole(allMachines),
    [allMachines, filterMachinesByRole]
  );

  const normalizedMachines = useMemo(() => {
    return roleScopedMachines.map((machine) => {
      const productId =
        machine['Product ID'] || machine.productId || machine.product_id;
      const machineType =
        machine['Type'] || machine.type || machine.Type || 'M';
      return {
        raw: machine,
        productId,
        type: machineType,
        location: deriveLocation(productId)
      };
    });
  }, [roleScopedMachines]);

  const fetchMachines = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMachines();
      setAllMachines(data);
      setError(null);
    } catch (err) {
      setError('Error fetching machine inventory.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStatuses = useCallback(async () => {
    if (!normalizedMachines.length) {
      setStatusMap({});
      return;
    }
    try {
      setStatusLoading(true);
      setStatusError(null);
      const results = await Promise.all(
        normalizedMachines.map(async ({ productId, type }) => {
          try {
            const prediction = await runMachineSimulation(type);
            const hasFailure =
              prediction.failure_type &&
              prediction.failure_type !== 'No Failure Detected';
            return [
              productId,
              {
                ...prediction,
                hasFailure,
                displayMessage: hasFailure
                  ? prediction.failure_type
                  : 'No failures detected',
                statusColor: hasFailure ? '#ffebee' : '#e8f5e9'
              }
            ];
          } catch (simulationError) {
            return [
              productId,
              {
                hasFailure: true,
                displayMessage:
                  simulationError?.response?.data?.error ||
                  simulationError?.message ||
                  'Simulation unavailable',
                statusColor: '#ffebee'
              }
            ];
          }
        })
      );
      setStatusMap(Object.fromEntries(results));
    } catch (err) {
      setStatusError('Unable to fetch live machine statuses.');
    } finally {
      setStatusLoading(false);
    }
  }, [normalizedMachines]);

  useEffect(() => {
    fetchMachines();
  }, [fetchMachines]);

  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  const getRowStyles = (productId) => {
    const statusEntry = statusMap[productId];
    if (!statusEntry) {
      return {
        backgroundColor: '#f5f5f5'
      };
    }
    return {
      backgroundColor: statusEntry.statusColor,
      transition: 'background-color 0.3s ease'
    };
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1400, margin: '0 auto' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Machine Health Dashboard
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            color="secondary"
            component={RouterLink}
            to="/machines"
            startIcon={<TableChartIcon />}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            View Machine Table
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={fetchStatuses}
            disabled={statusLoading}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {statusLoading ? 'Refreshing...' : 'Generate Random Errors'}
          </Button>
        </Box>
      </Box>

      {statusError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {statusError}
        </Alert>
      )}

      {normalizedMachines.length === 0 ? (
        <Typography variant="h6" textAlign="center" sx={{ mt: 4 }}>
          No machines available for your role.
        </Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Machine ID</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Current Error</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {normalizedMachines.map(({ productId, type, location }) => (
                <TableRow key={productId} sx={getRowStyles(productId)} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{productId}</TableCell>
                  <TableCell>{type}</TableCell>
                  <TableCell>{location}</TableCell>
                  <TableCell>
                    {statusMap[productId]?.displayMessage || 'Awaiting simulation'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default MachineDashboard;

