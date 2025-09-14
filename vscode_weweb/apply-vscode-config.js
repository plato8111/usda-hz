#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Apply VSCode configuration to a target project
 * Usage: node apply-vscode-config.js /path/to/target/project
 */

const targetPath = process.argv[2];

if (!targetPath) {
  console.error('❌ Please provide target project path');
  console.log('Usage: node apply-vscode-config.js /path/to/target/project');
  process.exit(1);
}

const configFiles = [
  { source: '.vscode/settings.json', target: '.vscode/settings.json' },
  { source: '.vscode/extensions.json', target: '.vscode/extensions.json' },
  { source: '.eslintrc', target: '.eslintrc' },
  { source: '.prettierrc', target: '.prettierrc' }
];

console.log('🚀 Applying VSCode configuration to:', targetPath);

// Create target directories if they don't exist
const vscodeDir = path.join(targetPath, '.vscode');
if (!fs.existsSync(vscodeDir)) {
  fs.mkdirSync(vscodeDir, { recursive: true });
  console.log('✅ Created .vscode directory');
}

// Copy configuration files
configFiles.forEach(file => {
  const sourcePath = path.join(__dirname, file.source);
  const targetPath = path.join(targetPath, file.target);
  
  if (fs.existsSync(sourcePath)) {
    try {
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`✅ Copied ${file.source} → ${file.target}`);
    } catch (error) {
      console.error(`❌ Failed to copy ${file.source}:`, error.message);
    }
  } else {
    console.warn(`⚠️  Source file not found: ${file.source}`);
  }
});

console.log('🎉 VSCode configuration applied successfully!');
console.log('');
console.log('📋 Next steps:');
console.log('1. Open the target project in VSCode');
console.log('2. Install recommended extensions when prompted');
console.log('3. Restart VSCode to apply all settings');
console.log('4. Your project is now configured for optimal Vue.js development!');