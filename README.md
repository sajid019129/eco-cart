# Eco-Cart

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

## Sprint Details

### Sprint 1 Features
- Initial project structure & basic layout
- Database schema and server configuration

### Sprint 2 Completed Features
- **User Authentication**: Secure JWT-based Login and Registration.
- **Product Search & Filtering**: Advanced search by query and category filtering.
- **Shopping Cart Management**: Interactive product addition, quantity adjustment, item removal, and checkout simulation.
- **Automated Testing**: Selenium UI test scripts for auth, search, and cart functionality.

## Tech Stack
- **Frontend**: React, React Router, Axios, Vite
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Testing**: Selenium WebDriver