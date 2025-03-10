import React, { useState, useEffect } from 'react';
import { ProgressBar, Form, Button, ListGroup, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [host, setHost] = useState('localhost');
  const [startPort, setStartPort] = useState(1);
  const [endPort, setEndPort] = useState(1024);
  const [protocol, setProtocol] = useState('tcp');
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState([]);
  const [openPorts, setOpenPorts] = useState([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  // Start the scan
  const startScan = async () => {
    setScanning(true);
    setResults([]);
    setOpenPorts([]);
    setError('');
    try {
      const [scanResults, err] = await window.wails.Call('StartScan', host, startPort, endPort, protocol);
      if (err) {
        setError(err);
        await window.wails.Call('LogError', err);
      } else {
        setResults(scanResults);
        setOpenPorts(scanResults.filter(r => r.includes("OPEN")).map(r => parseInt(r.split(' ')[1])));
      }
    } catch (e) {
      setError('Unexpected error occurred');
      await window.wails.Call('LogError', e.message);
    } finally {
      setScanning(false);
    }
  };

  // Update progress
  useEffect(() => {
    if (scanning) {
      const interval = setInterval(async () => {
        const prog = await window.wails.Call('GetProgress');
        setProgress(prog);
        if (prog >= 100) clearInterval(interval);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [scanning]);

  // Stop the scan
  const stopScan = async () => {
    await window.wails.Call('StopScan');
    setScanning(false);
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center text-primary mb-4">Port Scanner</h1>
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>IP à scanner</Form.Label>
          <Form.Control
            type="text"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            disabled={scanning}
            placeholder="Ex: localhost ou 192.168.1.1"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Port de départ</Form.Label>
          <Form.Control
            type="number"
            value={startPort}
            onChange={(e) => setStartPort(parseInt(e.target.value))}
            disabled={scanning}
            min="1"
            max="65535"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Port de fin</Form.Label>
          <Form.Control
            type="number"
            value={endPort}
            onChange={(e) => setEndPort(parseInt(e.target.value))}
            disabled={scanning}
            min="1"
            max="65535"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Protocole</Form.Label>
          <Form.Select
            value={protocol}
            onChange={(e) => setProtocol(e.target.value)}
            disabled={scanning}
          >
            <option value="tcp">TCP</option>
            <option value="udp">UDP</option>
          </Form.Select>
        </Form.Group>
        <Button
          variant="primary"
          onClick={startScan}
          disabled={scanning}
          className="me-2"
        >
          Start
        </Button>
        <Button
          variant="danger"
          onClick={stopScan}
          disabled={!scanning}
        >
          Stop
        </Button>
      </Form>

      {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

      <ProgressBar
        now={progress}
        label={`${Math.round(progress)}%`}
        className="mt-3"
        variant="success"
      />

      <h3 className="mt-4">Résultats du scan</h3>
      <div className="results-container">
        {results.map((result, index) => (
          <p
            key={index}
            style={{ color: result.includes("OPEN") ? '#28a745' : '#dc3545' }}
          >
            {result}
          </p>
        ))}
      </div>

      <h3 className="mt-4">Ports ouverts</h3>
      <ListGroup className="open-ports-container">
        {openPorts.map((port) => (
          <ListGroup.Item key={port} variant="success">
            Port {port}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
}

export default App;