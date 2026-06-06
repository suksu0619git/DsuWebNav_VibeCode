import fs from 'fs';
import path from 'path';

const srcDir = './frontend/src';

const replacements = [
  { from: /text-slate-200/g, to: 'text-slate-700' },
  { from: /text-slate-300/g, to: 'text-slate-600' },
  { from: /text-slate-400/g, to: 'text-slate-500' },
  { from: /bg-slate-900\/50/g, to: 'bg-slate-100/50' },
  { from: /bg-slate-900/g, to: 'bg-slate-50' },
  { from: /bg-slate-800\/50/g, to: 'bg-slate-50/80' },
  { from: /bg-slate-800\/80/g, to: 'bg-slate-100/80' },
  { from: /bg-slate-800\/40/g, to: 'bg-white' },
  { from: /bg-slate-800\/30/g, to: 'bg-slate-50' },
  { from: /bg-slate-800\/20/g, to: 'bg-slate-50' },
  { from: /bg-slate-800/g, to: 'bg-white' },
  { from: /bg-slate-700\/50/g, to: 'bg-slate-200/50' },
  { from: /bg-slate-700/g, to: 'bg-slate-200' },
  { from: /border-slate-700/g, to: 'border-slate-200' },
  { from: /border-slate-600/g, to: 'border-slate-300' },
  { from: /hover:bg-slate-800/g, to: 'hover:bg-slate-100' },
  { from: /hover:bg-slate-700/g, to: 'hover:bg-slate-200' },
  { from: /hover:bg-slate-600/g, to: 'hover:bg-slate-300' },
  { from: /text-white/g, to: 'text-white' }, // Buttons should stay white
  { from: /bg-surface/g, to: 'bg-white' },
  { from: /bg-background/g, to: 'bg-slate-50' }
];

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      let newContent = content;
      if (file === 'Timetable.jsx') {
        newContent = newContent.replace(/#0f172a/g, '#f8fafc');
        newContent = newContent.replace(/#1e293b/g, '#ffffff');
        newContent = newContent.replace(/#1a2332/g, '#ffffff');
        newContent = newContent.replace(/#334155/g, '#e2e8f0');
        newContent = newContent.replace(/#475569/g, '#64748b');
        newContent = newContent.replace(/#f1f5f9/g, '#1e293b');
        newContent = newContent.replace(/#1e3a5f/g, '#e2e8f0');
      }
      
      for (const r of replacements) {
        newContent = newContent.replace(r.from, r.to);
      }
      
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDir(srcDir);
console.log('Done converting themes.');
