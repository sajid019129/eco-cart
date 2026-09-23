# Eco-Cart (Sprint 1)

## Setup & Running Locally

### 1. Environment Variables
Create a `.env` file inside the `server/` folder:
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/eco-cart
JWT_SECRET=secretkey

### 2. Backend Setup
cd server
npm install
node index.js

### 3. Frontend Setup
Open a new terminal:
cd client
npm install
npm run dev
