# Development Environment Setup

For the best development experience with this basketball website project, I recommend installing the following:

## 1. Python (Recommended)
Python comes with a simple HTTP server that's perfect for local development.

1. Download Python from: https://www.python.org/downloads/
2. During installation, make sure to check "Add Python to PATH"
3. After installation, open Command Prompt and run:
   ```
   python -m http.server
   ```
4. Your website will be available at http://localhost:8000

## 2. Node.js (Alternative)
Node.js provides more advanced development capabilities.

1. Download Node.js from: https://nodejs.org/
2. Install with default settings
3. After installation, open Command Prompt, navigate to your project folder and run:
   ```
   npx serve
   ```
4. Your website will be available at the URL shown in the terminal

## 3. Live Server Extension (For VS Code users)
If you use Visual Studio Code, you can install the Live Server extension for an even simpler experience.

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Live Server" and install
4. Right-click on index.html and select "Open with Live Server"

## Using the Temporary Server
Until you install one of the above options, you can use the included `start-server.bat` file which creates a simple server using PowerShell.
