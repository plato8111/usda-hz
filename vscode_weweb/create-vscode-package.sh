#!/bin/bash

# Create VSCode Configuration Package
# This script packages the complete VSCode configuration for easy copying

echo "🚀 Creating VSCode Configuration Package..."

# Create package directory
mkdir -p vscode-config-package
cd vscode-config-package

# Copy VSCode configuration files
echo "📋 Copying VSCode configuration files..."
cp -r ../.vscode . 2>/dev/null || echo "⚠️  .vscode directory not found, creating from templates..."

# Copy linting and formatting files
echo "🔧 Copying linting and formatting configuration..."
cp ../.eslintrc . 2>/dev/null || echo "⚠️  .eslintrc not found"
cp ../.prettierrc . 2>/dev/null || echo "⚠️  .prettierrc not found"

# Copy standalone configuration files
echo "📄 Copying standalone configuration files..."
cp ../vscode-settings.json .
cp ../extensions.json .
cp ../apply-vscode-config.js .
cp ../README-VSCODE-SETUP.md .
cp ../vscode-config-package.json .

# Create .vscode directory with templates if not exists
if [ ! -d ".vscode" ]; then
  echo "🏗️  Creating .vscode directory with templates..."
  mkdir -p .vscode

  # Create settings.json if not exists
  if [ ! -f ".vscode/settings.json" ]; then
    cat > .vscode/settings.json << 'EOF'
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.detectIndentation": false,
  "files.associations": {
    "*.vue": "vue"
  },
  "emmet.includeLanguages": {
    "vue-html": "html",
    "vue": "html"
  },
  "vetur.validation.template": false,
  "vetur.validation.script": false,
  "vetur.validation.style": false,
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "vue"
  ],
  "prettier.singleQuote": true,
  "prettier.tabWidth": 2,
  "prettier.useTabs": false,
  "prettier.semi": true,
  "prettier.trailingComma": "es5",
  "prettier.bracketSpacing": true,
  "prettier.arrowParens": "avoid",
  "prettier.endOfLine": "lf",
  "[vue]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[jsonc]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "editor.rulers": [80, 120],
  "editor.wordWrap": "wordWrapColumn",
  "editor.wordWrapColumn": 120,
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,
  "files.trimFinalNewlines": true,
  "git.enableSmartCommit": true,
  "git.confirmSync": false,
  "terminal.integrated.fontSize": 14,
  "workbench.colorTheme": "Default Dark+",
  "editor.minimap.enabled": true,
  "editor.bracketPairColorization.enabled": true,
  "editor.guides.bracketPairs": true,
  "vue.codeActions.enabled": true,
  "vue.complete.casing.tags": "kebab",
  "vue.complete.casing.props": "camel",
  "editor.quickSuggestions": {
    "other": true,
    "comments": false,
    "strings": false
  },
  "editor.suggest.snippetsPreventQuickSuggestions": false,
  "html.format.enable": false,
  "css.validate": false,
  "less.validate": false,
  "scss.validate": false
}
EOF
  fi

  # Create extensions.json if not exists
  if [ ! -f ".vscode/extensions.json" ]; then
    cat > .vscode/extensions.json << 'EOF'
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "octref.vetur",
    "bradlc.vscode-tailwindcss",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-typescript-next",
    "ms-vscode.vscode-json",
    "redhat.vscode-yaml",
    "eamodio.gitlens",
    "ms-vscode.vscode-npm-script",
    "vue.volar",
    "vue.vscode-typescript-vue-plugin"
  ],
  "unwantedRecommendations": [
    "octref.vetur"
  ]
}
EOF
  fi
fi

# Create final package structure
echo "📦 Creating final package structure..."

# Create a comprehensive package
cat > package-info.json << 'EOF'
{
  "name": "weweb-vscode-config",
  "version": "1.0.0",
  "description": "Complete VSCode configuration for WeWeb component development with nuclear option dragging solution",
  "files": [
    ".vscode/",
    ".eslintrc",
    ".prettierrc",
    "vscode-settings.json",
    "extensions.json",
    "apply-vscode-config.js",
    "README-VSCODE-SETUP.md"
  ],
  "scripts": {
    "apply": "node apply-vscode-config.js",
    "setup": "echo 'Run: node apply-vscode-config.js /path/to/your/project'"
  }
}
EOF

# Create installation script
cat > install.sh << 'EOF'
#!/bin/bash

echo "🚀 Installing VSCode Configuration for WeWeb Development..."
echo "This configuration includes the nuclear option solution for dragging issues."

# Check if target path is provided
if [ -z "$1" ]; then
  echo "❌ Please provide target project path"
  echo "Usage: ./install.sh /path/to/your/project"
  exit 1
fi

TARGET_PATH="$1"

echo "📋 Installing to: $TARGET_PATH"

# Run the configuration application
node apply-vscode-config.js "$TARGET_PATH"

echo "🎉 Installation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Open your project in VSCode"
echo "2. Install recommended extensions when prompted"
echo "3. Restart VSCode to apply all settings"
echo "4. Start developing with the nuclear option dragging solution!"
EOF

chmod +x install.sh

echo "✅ VSCode Configuration Package Created Successfully!"
echo ""
echo "📦 Package contents:"
ls -la
echo ""
echo "🚀 To use this package:"
echo "1. Copy this entire directory to your target project"
echo "2. Run: ./install.sh /path/to/your/project"
echo "3. Or manually copy the files as described in README-VSCODE-SETUP.md"
echo ""
echo "🎯 This configuration includes the complete setup used to solve the WeWeb dragging issue!"
