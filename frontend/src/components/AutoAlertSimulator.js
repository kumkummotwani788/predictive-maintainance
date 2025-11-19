import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  Bolt as BoltIcon,
  Replay as ReplayIcon
} from '@mui/icons-material';
import { runMachineSimulation } from '../api';

const STATUS_INTENSITY = {
  HEALTHY: 'success',
  WARNING: 'warning',
  CRITICAL: 'error'
};

const AUTO_TICK_MS = 8000;

const getMachineLabel = (type) => {
  switch (type) {
    case 'H':
      return 'High-Performance (H)';
    case 'M':
      return 'Medium-Performance (M)';
    case 'L':
      return 'Low-Performance (L)';
    default:
      return type || 'Unknown';
  }
};

const normalizeMachineId = (value) => value?.toString().trim().toLowerCase();

const AutoAlertSimulator = ({ machines = [], userRole = 'admin' }) => {
  const [isAutoModeEnabled, setIsAutoModeEnabled] = useState(false);
  const [machineIdInput, setMachineIdInput] = useState('');
  const [latestSnapshot, setLatestSnapshot] = useState(null);
  const [activeAlert, setActiveAlert] = useState(null);
  const [requestError, setRequestError] = useState(null);
  const [isRequestRunning, setIsRequestRunning] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [selectedMachineMeta, setSelectedMachineMeta] = useState(null);
  const timerRef = useRef(null);

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
    () => filterMachinesByRole(machines),
    [machines, filterMachinesByRole]
  );

  const lookupMachineById = useCallback(
    (machineId) => {
      if (!machineId) return null;
      const normalized = normalizeMachineId(machineId);
      return (
        roleScopedMachines.find((machine) => {
          const productId =
            machine['Product ID'] || machine.productId || machine.product_id;
          return normalizeMachineId(productId) === normalized;
        }) || null
      );
    },
    [roleScopedMachines]
  );

  const highlightSeverity = (status, failureType) => {
    if (!failureType || failureType === 'No Failure Detected') {
      return STATUS_INTENSITY.HEALTHY;
    }
    if (status === 'WARNING') {
      return STATUS_INTENSITY.CRITICAL;
    }
    return STATUS_INTENSITY[status] || STATUS_INTENSITY.HEALTHY;
  };

  const deriveDisplayStatus = (baseStatus, failureType) => {
    if (failureType && failureType !== 'No Failure Detected') {
      return baseStatus === 'HEALTHY' ? 'WARNING' : baseStatus;
    }
    return baseStatus;
  };

  const statusVisualStyle = (status, failureType) => {
    const noFailure = !failureType || failureType === 'No Failure Detected';
    if (noFailure) {
      return {
        bg: '#e8f5e9',
        border: '#2e7d32',
        text: '#1b5e20'
      };
    }
    if (status === 'WARNING') {
      return {
        bg: '#ffebee',
        border: '#c62828',
        text: '#b71c1c'
      };
    }
    if (status === 'CRITICAL') {
      return {
        bg: '#ffebee',
        border: '#b71c1c',
        text: '#880e4f'
      };
    }
    return {
      bg: '#e3f2fd',
      border: '#1565c0',
      text: '#0d47a1'
    };
  };

  const runSimulationCycle = useCallback(async () => {
    if (!machineIdInput.trim()) {
      setRequestError('Enter a machine ID before running the simulator.');
      return;
    }

    const machineMatch = lookupMachineById(machineIdInput);
    if (!machineMatch) {
      setRequestError(`Machine ${machineIdInput} is not accessible for your role.`);
      return;
    }

    const machineType =
      machineMatch['Type'] ||
      machineMatch.type ||
      machineMatch.Type ||
      'M';

    const effectiveType = ['H', 'M', 'L'].includes(machineType)
      ? machineType
      : 'M';

    try {
      setIsRequestRunning(true);
      setRequestError(null);

      const response = await runMachineSimulation(effectiveType);
      const displayStatus = deriveDisplayStatus(
        response.alert_status,
        response.failure_type
      );

      setLatestSnapshot(response);
      setSelectedMachineMeta({
        id:
          machineMatch['Product ID'] ||
          machineMatch.productId ||
          machineMatch.product_id,
        type: effectiveType
      });
      setActiveAlert({
        status: displayStatus,
        failure: response.failure_type,
        rul: response.rul,
        timestamp: response.timestamp,
        confidence: response.confidence,
        machineType: effectiveType
      });
      setSnackbarVisible(true);
    } catch (error) {
      const message =
        error?.response?.data?.error ||
        error?.message ||
        'Unable to complete simulation';
      setRequestError(message);
    } finally {
      setIsRequestRunning(false);
    }
  }, [lookupMachineById, machineIdInput]);

  useEffect(() => {
    if (!isAutoModeEnabled) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return undefined;
    }

    runSimulationCycle();
    timerRef.current = setInterval(runSimulationCycle, AUTO_TICK_MS);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isAutoModeEnabled, runSimulationCycle]);

  const handleManualTrigger = () => {
    if (isRequestRunning) return;
    runSimulationCycle();
  };

  const handleAutoToggle = () => {
    setIsAutoModeEnabled((prev) => !prev);
  };

  const handleSnackbarClose = () => {
    setSnackbarVisible(false);
  };

  return (
    <>
      <Paper
        elevation={4}
        sx={{
          p: 3,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <BoltIcon color="primary" />
            <Typography variant="h6" component="h2">
              Live Machine Simulator
            </Typography>
          </Box>
          <Chip
            label={isAutoModeEnabled ? 'Auto mode' : 'Manual mode'}
            color={isAutoModeEnabled ? 'primary' : 'default'}
            size="small"
          />
        </Box>

        <Typography variant="body2" color="text.secondary">
          Streaming real machine IDs into the simulator to generate synthetic
          sensor data and preview the ML-alert pipeline without touching
          hardware.
        </Typography>

        <TextField
          label="Machine ID"
          placeholder="Enter an ID visible in the table"
          value={machineIdInput}
          onChange={(event) => setMachineIdInput(event.target.value)}
          size="small"
          fullWidth
          InputLabelProps={{ shrink: true }}
        />

        {requestError && (
          <Alert
            severity="error"
            onClose={() => setRequestError(null)}
            sx={{ my: 1 }}
          >
            {requestError}
          </Alert>
        )}

        <Divider flexItem />

        {latestSnapshot ? (
          <Box display="flex" flexDirection="column" gap={2}>
            {(() => {
              const effectiveStatus =
                activeAlert?.status || latestSnapshot.alert_status;
              const styles = statusVisualStyle(
                effectiveStatus,
                latestSnapshot.failure_type
              );
              return (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    borderLeft: `6px solid ${styles.border}`,
                    backgroundColor: styles.bg,
                    color: styles.text
                  }}
                >
                  <Typography variant="subtitle2">
                    Status: {effectiveStatus}
                  </Typography>
                  <Typography variant="body2">
                    {latestSnapshot.failure_type} • Confidence{' '}
                    {latestSnapshot.confidence}%
                  </Typography>
                </Box>
              );
            })()}

            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Paper variant="outlined" sx={{ p: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    Remaining Useful Life
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {latestSnapshot.rul}h
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper variant="outlined" sx={{ p: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    Machine
                  </Typography>
                  <Stack spacing={0.25}>
                    <Typography variant="body2">
                      {selectedMachineMeta?.id || machineIdInput}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getMachineLabel(selectedMachineMeta?.type || latestSnapshot.machine_type)}
                    </Typography>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>

            <Paper
              variant="outlined"
              sx={{ p: 1.5, backgroundColor: 'background.default' }}
            >
              <Typography variant="caption" color="text.secondary">
                Sensor snapshot
              </Typography>
              <Grid container spacing={1} sx={{ mt: 0.5 }}>
                {Object.entries(latestSnapshot.sensor_data || {}).map(
                  ([metric, value]) => (
                    <Grid item xs={6} key={metric}>
                      <Typography variant="body2" fontWeight={600}>
                        {metric}
                      </Typography>
                      <Typography variant="body2">
                        {typeof value === 'number' ? value.toFixed(2) : value}
                      </Typography>
                    </Grid>
                  )
                )}
              </Grid>
            </Paper>

            <Typography variant="caption" color="text.secondary">
              Last refresh: {new Date(latestSnapshot.timestamp).toLocaleString()}
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              minHeight: 160,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isRequestRunning ? (
              <CircularProgress size={32} />
            ) : (
              <Typography variant="body2" color="text.secondary" align="center">
                Enter a machine ID, then start the simulator to stream synthetic
                readings and watch alerts fire automatically.
              </Typography>
            )}
          </Box>
        )}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button
            fullWidth
            variant={isAutoModeEnabled ? 'contained' : 'outlined'}
            color={isAutoModeEnabled ? 'secondary' : 'primary'}
            onClick={handleAutoToggle}
            startIcon={isAutoModeEnabled ? <StopIcon /> : <PlayArrowIcon />}
            disabled={!machineIdInput.trim()}
          >
            {isAutoModeEnabled ? 'Stop Auto Stream' : 'Start Auto Stream'}
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleManualTrigger}
            startIcon={<ReplayIcon />}
            disabled={isRequestRunning || !machineIdInput.trim()}
          >
            Pulse Once
          </Button>
        </Stack>
      </Paper>

      <Snackbar
        open={snackbarVisible}
        onClose={handleSnackbarClose}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {activeAlert ? (
          <Alert
            onClose={handleSnackbarClose}
            severity={highlightSeverity(activeAlert.status, activeAlert.failure)}
            sx={{ width: '100%' }}
          >
            {activeAlert.status} alert for {getMachineLabel(activeAlert.machineType)} ·
            Predicted failure: {activeAlert.failure} · RUL {activeAlert.rul}h
          </Alert>
        ) : null}
      </Snackbar>
    </>
  );
};

export default AutoAlertSimulator;

