# Commands Quick Reference

## Windows PowerShell Commands

### 📦 Installation Commands

```powershell
# Backend setup
cd backend
npm install
copy .env.example .env

# Frontend setup
cd frontend
npm install

# ML setup (optional)
cd ML_code
pip install -r requirements.txt
```

---

## 🚀 Running the Application

### Start Backend (Terminal 1)
```powershell
cd backend
npm start
# or
node server.js
```

### Start Frontend (Terminal 2)
```powershell
cd frontend
npm start
```

### Run ML Demo (Terminal 3 - Optional)
```powershell
cd ML_code
python test_demo.py
```

---

## 🧪 Testing Commands

### Test Backend Health
```powershell
curl http://localhost:5000/health
```

### Test Login API
```powershell
curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"role\":\"admin\",\"password\":\"admin123\"}'
```

### Test Simulation API
```powershell
curl -X POST http://localhost:5000/api/prediction/simulate `
  -H "Content-Type: application/json" `
  -d '{\"machineType\":\"M\"}'
```

### Test Python ML Module
```powershell
cd ML_code
python -c "from ml_model_inference import run_simulation; print(run_simulation('M'))"
```

---

## 📋 Project Navigation

### Navigate to Backend
```powershell
cd d:\predictive-maintainance-1\backend
```

### Navigate to Frontend
```powershell
cd d:\predictive-maintainance-1\frontend
```

### Navigate to ML Code
```powershell
cd d:\predictive-maintainance-1\ML_code
```

### View File Structure
```powershell
tree /F
```

### List Contents
```powershell
dir
ls
```

---

## 🔧 Configuration Commands

### Create .env file
```powershell
cd backend
copy .env.example .env
# Then edit .env with your preferred editor
```

### View .env file
```powershell
cd backend
type .env
```

### Edit Configuration
```powershell
# Open with default editor
notepad .env
# Or with VS Code
code .env
```

---

## 🧹 Cleanup Commands

### Remove node_modules (Backend)
```powershell
cd backend
rm -r node_modules
rm package-lock.json
```

### Remove node_modules (Frontend)
```powershell
cd frontend
rm -r node_modules
rm package-lock.json
```

### Clear npm cache
```powershell
npm cache clean --force
```

### Clean build files
```powershell
cd frontend
rm -r build
```

---

## 📊 Checking Process Status

### Check if Backend is Running
```powershell
Test-NetConnection -ComputerName localhost -Port 5000
```

### Check Port Usage
```powershell
netstat -ano | findstr :5000
```

### Kill Process on Port
```powershell
# Replace PID with actual process ID
taskkill /PID 12345 /F

# Or kill by port (more direct)
netstat -ano | findstr :5000 | findstr LISTENING
```

---

## 🔐 Git Commands

### Initialize Repository
```powershell
git init
git add .
git commit -m "Initial commit"
```

### Check Git Status
```powershell
git status
```

### View Changes
```powershell
git diff
git log --oneline
```

### Ignore Files
```powershell
# Check what's in .gitignore
type .gitignore

# Create .gitignore (if missing)
echo "node_modules/" > .gitignore
echo ".env" >> .gitignore
```

---

## 📁 File Operations

### Copy Files
```powershell
copy source.js destination.js
cp source.js destination.js
```

### Move/Rename Files
```powershell
mv old-name.js new-name.js
move old-name.js new-name.js
```

### Delete Files
```powershell
rm filename.js
del filename.js
```

### Create New File
```powershell
new-item filename.js
echo. > filename.js
```

### View File Contents
```powershell
type filename.js
cat filename.js
```

---

## 🔍 Search Commands

### Find Files by Name
```powershell
dir /s /b *simulator*
ls -r *simulator*
```

### Search Text in Files
```powershell
findstr /s "TODO" *.js
sls "TODO" -r
```

### Find All JavaScript Files
```powershell
dir /s /b *.js
ls -r *.js
```

### Find All Python Files
```powershell
dir /s /b *.py
ls -r *.py
```

---

## 🚀 Development Commands

### Install Specific Package (NPM)
```powershell
npm install package-name
npm install --save package-name
npm install --save-dev package-name
```

### Install Specific Package (Pip)
```powershell
pip install package-name
pip install package-name==version
```

### Update Packages
```powershell
npm update
pip install --upgrade package-name
```

### Build Frontend for Production
```powershell
cd frontend
npm run build
```

---

## 📖 Documentation Commands

### View README
```powershell
type README.md
cat README.md
```

### Open in VS Code
```powershell
code .
code filename.js
```

### Open File with Default App
```powershell
start filename.md
```

---

## 🐛 Debugging Commands

### Check Node Version
```powershell
node --version
node -v
```

### Check NPM Version
```powershell
npm --version
npm -v
```

### Check Python Version
```powershell
python --version
python -V
```

### Check Pip Version
```powershell
pip --version
pip -V
```

### List Installed Packages (NPM)
```powershell
npm list
npm list -g
```

### List Installed Packages (Pip)
```powershell
pip list
pip show package-name
```

---

## 🌐 Network Commands

### Test Connectivity
```powershell
Test-Connection localhost
ping localhost
```

### Test Port Connectivity
```powershell
Test-NetConnection -ComputerName localhost -Port 5000
```

### Check Open Ports
```powershell
netstat -an
netstat -ano | findstr LISTENING
```

### Get Local IP Address
```powershell
ipconfig
Get-NetIPAddress
```

---

## 📚 Documentation View

### View All Documentation
```powershell
# List all markdown files
dir *.md
ls *.md

# View specific documentation
type README.md
type SETUP.md
type TESTING_GUIDE.md
type VARIABLES_REFERENCE.md
```

---

## 🔄 Environment Variables

### View Environment Variables
```powershell
env
Get-ChildItem env:
```

### Set Environment Variable (Temporary)
```powershell
$env:NODE_ENV = "production"
$env:PORT = "5000"
```

### Set Environment Variable (Permanent)
```powershell
[System.Environment]::SetEnvironmentVariable("NODE_ENV", "production", "User")
```

---

## 💡 Useful Combinations

### Full Backend Reinstall
```powershell
cd backend
rm -r node_modules
rm package-lock.json
npm install
npm start
```

### Full Frontend Reinstall
```powershell
cd frontend
rm -r node_modules
rm package-lock.json
npm install
npm start
```

### Check Everything is Running
```powershell
# Terminal 1
curl http://localhost:5000/health

# Terminal 2
Test-NetConnection -ComputerName localhost -Port 3000

# If Python:
# Terminal 3
python ML_code/test_demo.py
```

---

## 🚨 Emergency Commands

### Kill All Node Processes
```powershell
taskkill /IM node.exe /F
```

### Kill All Python Processes
```powershell
taskkill /IM python.exe /F
```

### Reset All Port Conflicts
```powershell
# Change port in .env
# Change port in frontend/src/api.js
# Restart both servers
```

---

## 📝 Logging & Output

### Save Command Output to File
```powershell
command > output.txt
command | Out-File output.txt
```

### Append Output to File
```powershell
command >> output.txt
command | Add-Content output.txt
```

### View File with Line Numbers
```powershell
type filename.js | Select-Object -Property @{n='Line'; e={[array]::indexof($_)[0]}}, $_
```

---

## 🎯 Common Tasks

### Change to Root Directory
```powershell
cd d:\predictive-maintainance-1
```

### Open VS Code at Current Location
```powershell
code .
```

### Open Explorer at Current Location
```powershell
explorer .
```

### Create New Directory
```powershell
mkdir new-folder
md new-folder
```

### Copy Directory Recursively
```powershell
copy -r source-dir destination-dir
cp -r source-dir destination-dir
```

---

## 🔗 Quick Links

```powershell
# Open Browser URLs
start http://localhost:3000
start http://localhost:5000/health

# Open API Endpoints
start "http://localhost:5000/api/machines"
```

---

## ✅ Command Checklist for Fresh Start

```powershell
# 1. Setup Backend
cd d:\predictive-maintainance-1\backend
npm install
copy .env.example .env
npm start

# 2. Setup Frontend (new terminal)
cd d:\predictive-maintainance-1\frontend
npm install
npm start

# 3. Test (new terminal)
curl http://localhost:5000/health
```

---

**Version**: 1.0  
**Last Updated**: November 2024  
**OS**: Windows PowerShell  
**Status**: Complete Reference
