import fs from 'fs';
import path from 'path';

const srcDir = './frontend/src';
const componentsDir = './frontend/src/components';

function updateApiUrl(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const target = "import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';";
  const replacement = "import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://127.0.0.1:8000');";
  
  if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated API_URL in ${filePath}`);
  }
}

updateApiUrl(path.join(srcDir, 'App.jsx'));
updateApiUrl(path.join(componentsDir, 'CourseSearch.jsx'));
updateApiUrl(path.join(componentsDir, 'Chatbot.jsx'));
updateApiUrl(path.join(componentsDir, 'Timetable.jsx'));
