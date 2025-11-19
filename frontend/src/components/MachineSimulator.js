import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip
} from '@mui/material';
import { PlayArrow as PlayArrowIcon, Close as CloseIcon } from '@mui/icons-material';
import { runMachineSimulation } from '../api';

const MachineSimulator = ({ open, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [machineType, setMachineType] = useState('M');
  const [simulationResult, setSimulationResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSimulate = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await runMachineSimulation(machineType);
      
      if (result.success) {
        setSimulationResult(result);
      } else {
        setError(result.error || 'Simulation failed');
      }
    } catch (err) {
      setError('Error running simulation: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getAlertColor = (status) => {
    switch (status) {
      case 'CRITICAL':
        return 'error';
      case 'WARNING':
        return 'warning';
      case 'HEALTHY':
        return 'success';
      default:
        return 'info';
    }
  };

  const getMachineTypeLabel = (type) => {
    switch (type) {
      case 'H':
        return 'High-Performance';
      case 'M':
        return 'Medium-Performance';
      case 'L':
        return 'Low-Performance';
      default:
        return type;
    }
  };

  const handleClose = () => {
    setSimulationResult(null);
    setError(null);
    setMachineType('M');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Machine Health Simulator
      </DialogTitle>
      
      <DialogContent sx={{ py: 3 }}>
        {!simulationResult ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="body1">
              Generate random sensor data and predict machine health metrics including RUL (Remaining Useful Life) and potential failure types.
            </Typography>

            <FormControl fullWidth>
              <InputLabel>Machine Type</InputLabel>
              <Select
                value={machineType}
                label="Machine Type"
                onChange={(e) => setMachineType(e.target.value)}
              >
                <MenuItem value="H">High-Performance (H)</MenuItem>
                <MenuItem value="M">Medium-Performance (M)</MenuItem>
                <MenuItem value="L">Low-Performance (L)</MenuItem>
              </Select>
            </FormControl>

            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <Button
              variant="contained"
              color="primary"
              startIcon={<PlayArrowIcon />}
              onClick={handleSimulate}
              disabled={loading}
              size="large"
            >
              {loading ? 'Running Simulation...' : 'Run Simulation'}
            </Button>

            {loading && (
              <Box display="flex" justifyContent="center">
                <CircularProgress />
              </Box>
            )}
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Alert Status */}
            <Alert severity={getAlertColor(simulationResult.alert_status)}>
              <Typography variant="h6">
                Status: <strong>{simulationResult.alert_status}</strong>
              </Typography>
            </Alert>

            {/* Key Predictions */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Remaining Useful Life (RUL)
                  </Typography>
                  <Typography variant="h4" sx={{ color: 'primary.main', mt: 1 }}>
                    {simulationResult.rul} hours
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Failure Type
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 1 }}>
                    {simulationResult.failure_type}
                  </Typography>
                  <Chip
                    label={`${simulationResult.confidence}% Confidence`}
                    size="small"
                    sx={{ mt: 1 }}
                    color="primary"
                  />
                </Paper>
              </Grid>
            </Grid>

            {/* Machine Type Info */}
            <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
              <Typography variant="subtitle2" color="textSecondary">
                Machine Type
              </Typography>
              <Chip
                label={getMachineTypeLabel(simulationResult.machine_type)}
                sx={{ mt: 1 }}
                color="primary"
                variant="outlined"
              />
            </Paper>

            {/* Sensor Data */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Generated Sensor Data
              </Typography>
              <Grid container spacing={2}>
                {simulationResult.sensor_data && Object.entries(simulationResult.sensor_data).map(
                  ([key, value]) => (
                    key !== 'Type' && (
                      <Grid item xs={12} sm={6} key={key}>
                        <Box>
                          <Typography variant="caption" color="textSecondary">
                            {key}
                          </Typography>
                          <Typography variant="body2">
                            {typeof value === 'number' ? value.toFixed(2) : value}
                          </Typography>
                        </Box>
                      </Grid>
                    )
                  )
                )}
              </Grid>
            </Paper>

            {/* Timestamp */}
            <Typography variant="caption" color="textSecondary" align="center">
              Simulation Time: {new Date(simulationResult.timestamp).toLocaleString()}
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        {simulationResult && (
          <Button onClick={() => setSimulationResult(null)} color="primary">
            Run Another Simulation
          </Button>
        )}
        <Button onClick={handleClose} endIcon={<CloseIcon />}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MachineSimulator;
