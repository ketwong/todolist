# To-Do List App (React + Python Flask)

This project is a simple to-do list web application with:
- A React frontend (Vite)
- A Python Flask backend API

## Getting Started

### Backend (Flask)
Open two terminals for the backend and frontend.

**Terminal 1: Start the Flask backend**
1. Create and activate the virtual environment:
   ```bash
   source backend-venv/bin/activate
   ```
2. Install dependencies (if not already):
   ```bash
   pip install -r requirements.txt
   ```
   (This will install flask, flask-cors, and requests for AI integration.)
3. Run the Flask server:
   ```bash
   export FLASK_APP=backend_api.py
   flask run --debug
   ```

### Frontend (React)
**Terminal 2: Start the React frontend**
1. Install dependencies (if not already):
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```

## Features
- Add, view, update, and delete tasks
- React frontend communicates with Flask backend via REST API

---

Update this README as you add features or change the project structure.
