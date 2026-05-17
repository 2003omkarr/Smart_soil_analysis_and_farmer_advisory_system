# 📋 Complete Setup Guide

## Step-by-Step Installation

### Step 1: Install Prerequisites

#### Node.js and npm
```bash
# Download from https://nodejs.org/ (LTS version)
# Verify installation
node --version  # Should be 18+
npm --version
```

#### Python
```bash
# Download from https://www.python.org/ (3.11+)
# Verify installation
python --version  # or python3 --version
pip --version
```

#### MongoDB
**Option A: Local Installation**
- Download from https://www.mongodb.com/try/download/community
- Follow installation wizard
- Start MongoDB service

**Option B: Docker**
```bash
docker run -d -p 27017:27017 --name mongodb mon