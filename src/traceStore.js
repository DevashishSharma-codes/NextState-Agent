import fs from 'fs';
import path from 'path';

const TRACES_DIR = path.join(process.cwd(), 'traces');
const TRACE_FILE = path.join(TRACES_DIR, 'traces.jsonl');

export function saveTrace(trace) {
  if (!fs.existsSync(TRACES_DIR)) {
    fs.mkdirSync(TRACES_DIR, { recursive: true });
  }
  
  const traceLine = JSON.stringify(trace) + '\n';
  fs.appendFileSync(TRACE_FILE, traceLine, 'utf8');
}
