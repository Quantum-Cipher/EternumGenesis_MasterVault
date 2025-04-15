#!/usr/bin/env node

import fs from 'fs';
import { spawn } from 'child_process';
import { create } from 'ipfs-http-client';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup for __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Init IPFS client (default localhost)
const ipfs = create();

function isPrime(n) {
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) return false;
  }
  return true;
}

function isPrimeMathTarget(n) {
  for (let a = 2; a < 1000; a++) {
    if (!isPrime(a)) continue;
    for (let b = 2; b < 1000; b++) {
      if (!isPrime(b)) continue;
      if (
        a + b === n ||
        a - b === n ||
        a * b === n ||
        (b !== 0 && a / b === n)
      ) {
        return true;
      }
    }
  }
  return false;
}

// File paths
const logDir = path.join(__dirname, 'vault/logs');
const manifestDir = path.join(__dirname, 'vault/manifest');

const logPath = path.join(logDir, 'whisper-audit.log');
const ipfsLogPath = path.join(logDir, 'ipfs-sync-log.txt');
const manifestPath = path.join(manifestDir, 'eternum_sync_manifest.json');

// Ensure dirs exist
fs.mkdirSync(logDir, { recursive: true });
fs.mkdirSync(manifestDir, { recursive: true });

// Load or create manifest
let manifest = [];
if (fs.existsSync(manifestPath)) {
  manifest = JSON.parse(fs.readFileSync(manifestPath));
}

async function logToManifest(cid, note) {
  const entry = {
    cid,
    timestamp: new Date().toISOString(),
    reason: note
  };
  manifest.push(entry);
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  try {
    const manifestData = fs.readFileSync(manifestPath);
    const { cid: manifestCID } = await ipfs.add({
      path: 'eternum_sync_manifest.json',
      content: manifestData
    });
    console.log(`📜 Manifest updated and synced — CID: ${manifestCID}`);
  } catch (err) {
    console.error('❌ Failed to sync manifest:', err.message);
  }
}

// Start IPFS daemon and monitor its output
const daemon = spawn('ipfs', ['daemon']);

daemon.stdout.on('data', async (data) => {
  const lines = data.toString().split('\n');
  for (const line of lines) {
    const digits = line.match(/\d{4}/g);
    if (digits) {
      for (const group of digits) {
        const num = parseInt(group, 10);
        if (isPrimeMathTarget(num)) {
          const entry = `[${new Date().toISOString()}] Prime-logic match on "${num}" — ${line}\n`;
          fs.appendFileSync(logPath, entry);
          fs.appendFileSync(ipfsLogPath, entry);

          try {
            const file = fs.readFileSync(ipfsLogPath);
            const { cid } = await ipfs.add({ path: 'ipfs-sync-log.txt', content: file });
            console.log(`📡 Synced to IPFS — CID: ${cid}`);
            await logToManifest(cid, `Prime-logic match on ${num}`);
          } catch (err) {
            console.error('❌ IPFS sync failed:', err.message);
          }
        }
      }
    }
  }
});
