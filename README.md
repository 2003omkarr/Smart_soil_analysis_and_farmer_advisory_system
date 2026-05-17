# 🌱 AI-Based Smart Soil Health Analysis & Farmer Advisory System

A complete enterprise-level platform that helps farmers analyze soil health and receive AI-powered agricultural recommendations.

## 🏗️ Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   React.js      │─────▶│   Node.js +     │─────▶│   FastAPI       │
│   Frontend      │      │   Express API   │      │   AI Service    │
│   (Port 3000)   │◀─────│   (Port 5000)   │◀─────│   (Port 8000)   │
└─────────────────┘      └─────────────────┘      └─────────────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │    MongoDB      │
                         │   (Port 27017)  │
                         └─────────────────┘
```

## 🚀 Features

### Core Features
- ✅ User Authentication (JWT)
- ✅ Soil Report Upload & Management
- ✅ AI-Powered Crop Recommendations
- ✅ Soil Health Analysis
- ✅ Fertilizer Recommendations
- ✅ Irrigation Advice
- ✅ Weather-Based Suggestions
- ✅ Historical Report Analytics
- ✅ Interactive Data Visualization

### Future Modules (Architecture Ready)
- 🔄 OCR for Soil Report Extraction
- 🔄 Real-time Weather API Integration
- 🔄 Multilingual Support
- 🔄 Voice-Based Advisory
- 🔄 AI Chatbot
- 🔄 Disease Detection
- 🔄 PDF Report Generation

## 📦 Technology Stack

### Frontend
- React.js 18 + Vite
- Tailwind CSS
- Redux Toolkit
- React Router DOM v6
- Framer Motion
- Recharts
- Axios

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Multer (File Upload)
- Bcrypt

### AI/ML Service
- Python 3.11
- FastAPI
- Scikit-learn
- TensorFlow
- Pandas + NumPy
- Uvicorn

## 📁 Project Structure

```
smart-soil-advisory/
├── frontend/                    # React Application
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── pages/              # Page components
│   │   ├── services/           # API services
│   │   ├── store/              # Redux store & slices
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/                     # Node.js API
│   ├── config/                 # Configuration files
│   ├── controllers/            # Route controllers
│   ├── middleware/             # Custom middleware
│   ├── models/                 # Mongoose models
│   ├── routes/                 # API routes
│   ├── services/               # Business logic
│   ├── utils/                  # Utility functions
│   ├── uploads/                # File uploads
│   ├── server.js
│   └── package.json
│
├── ai-service/                  # FastAPI ML Service
│   ├── app/
│   │   ├── models/             # Pydantic schemas
│   │   ├── routes/             # API routes
│   │   └── services/           # ML services
│   ├── main.py
│   └── requirements.txt
│
├── docker-compose.yml
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- MongoDB 7.0+
- Git

### 1️⃣ Clone Repository

```bash
git clone <repository-url>
cd smart-soil-advisory
```

### 2️⃣ Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

Frontend will run on `http://localhost:3000`

### 3️⃣ Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env and add your MongoDB URI and JWT secret
# MONGO_URI=mongodb://localhost:27017/smart-soil-advisory
# JWT_SECRET=your_secret_key_here

# Start development server
npm run dev
```

Backend will run on `http://localhost:5000`

### 4️⃣ AI Service Setup

```bash
cd ai-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Start FastAPI server
python main.py
```

AI Service will run on `http://localhost:8000`

### 5️⃣ MongoDB Setup

**Option 1: Local Installation**
```bash
# Install MongoDB Community Edition
# Visit: https://www.mongodb.com/try/download/community

# Start MongoDB service
mongod
```

**Option 2: Docker**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:7.0
```

**Option 3: MongoDB Atlas (Cloud)**
- Sign up at https://www.mongodb.com/cloud/atlas
- Create a free cluster
- Get connection string and update `.env`

## 🐳 Docker Deployment

### Build and Run All Services

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

Services will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- AI Service: http://localhost:8000
- MongoDB: localhost:27017

## 📝 API Documentation

### Backend API Endpoints

#### Authentication
```
POST /api/auth/register    - Register new user
POST /api/auth/login       - Login user
GET  /api/auth/me          - Get current user
```

#### Soil Reports
```
POST   /api/soil/upload       - Upload soil report
GET    /api/soil/reports      - Get all reports
GET    /api/soil/reports/:id  - Get report by ID
DELETE /api/soil/reports/:id  - Delete report
```

#### Recommendations
```
GET /api/recommendations/:reportId  - Get recommendations
GET /api/recommendations            - Get all recommendations
```

### AI Service API Endpoints

```
POST /api/predict-crop    - Predict suitable crop
POST /api/soil-health     - Analyze soil health
GET  /health              - Health check
```

## 🧪 Testing the System

### 1. Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Farmer",
    "email": "john@example.com",
    "phone": "1234567890",
    "location": "California",
    "password": "password123"
  }'
```

### 2. Test AI Service
```bash
curl -X POST http://localhost:8000/api/predict-crop \
  -H "Content-Type: application/json" \
  -d '{
    "N": 90,
    "P": 42,
    "K": 43,
    "pH": 6.5,
    "rainfall": 202.9,
    "temperature": 20.8
  }'
```

## 🔐 Environment Variables

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=Smart Soil Advisory
```

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/smart-soil-advisory
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d
AI_SERVICE_URL=http://localhost:8000
UPLOAD_PATH=./uploads
```

### AI Service (.env)
```env
HOST=0.0.0.0
PORT=8000
ENVIRONMENT=development
MODEL_PATH=./models
```

## 📊 Sample Soil Data

Use this sample data for testing:

```json
{
  "farmName": "Green Valley Farm",
  "location": "California",
  "area": 10,
  "soilType": "Loamy",
  "N": 90,
  "P": 42,
  "K": 43,
  "pH": 6.5,
  "rainfall": 202.9,
  "temperature": 20.8
}
```

## 🎯 Development Workflow

1. **Start MongoDB**
2. **Start AI Service** (Port 8000)
3. **Start Backend** (Port 5000)
4. **Start Frontend** (Port 3000)
5. **Access Application** at http://localhost:3000

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :3000  # or :5000, :8000

# Kill process
kill -9 <PID>
```

### MongoDB Connection Error
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify network connectivity

### AI Service Import Errors
- Activate virtual environment
- Reinstall dependencies: `pip install -r requirements.txt`

## 📈 Performance Optimization

- Frontend: Code splitting, lazy loading
- Backend: Database indexing, caching
- AI Service: Model optimization, batch processing

## 🔒 Security Best Practices

- ✅ JWT token authentication
- ✅ Password hashing with bcrypt
- ✅ Input validation
- ✅ CORS configuration
- ✅ File upload restrictions
- ✅ Environment variable protection

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

Built with ❤️ for farmers worldwide

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Email: support@smartsoil.com

---

**Happy Farming! 🌾**
