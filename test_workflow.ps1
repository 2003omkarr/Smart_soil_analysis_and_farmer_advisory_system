# Test Workflow Script for Smart Soil Advisory System
# This script tests the complete end-to-end workflow

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing Smart Soil Advisory System" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Backend Health
Write-Host "[TEST 1] Testing Backend Health..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/" -Method Get
    Write-Host "✅ Backend is healthy: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend health check failed: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 2: FastAPI Health
Write-Host "[TEST 2] Testing FastAPI Health..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/health" -Method Get
    Write-Host "✅ FastAPI is healthy. Models loaded: $($response.models_loaded)" -ForegroundColor Green
} catch {
    Write-Host "❌ FastAPI health check failed: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 3: Register User
Write-Host "[TEST 3] Registering Test User..." -ForegroundColor Yellow
$registerData = @{
    name = "Test Farmer"
    email = "testfarmer$(Get-Random -Maximum 10000)@example.com"
    phone = "9876543210"
    location = "Maharashtra, India"
    password = "password123"
    role = "farmer"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
        -Method Post `
        -ContentType "application/json" `
        -Body $registerData
    
    $token = $registerResponse.token
    $userId = $registerResponse._id
    Write-Host "✅ User registered successfully" -ForegroundColor Green
    Write-Host "   User ID: $userId" -ForegroundColor Gray
    Write-Host "   Email: $($registerResponse.email)" -ForegroundColor Gray
} catch {
    Write-Host "❌ User registration failed: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 4: Login
Write-Host "[TEST 4] Testing Login..." -ForegroundColor Yellow
$loginData = @{
    email = $registerResponse.email
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $loginData
    
    $token = $loginResponse.token
    Write-Host "✅ Login successful" -ForegroundColor Green
    Write-Host "   Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Login failed: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 5: Create Manual Soil Report
Write-Host "[TEST 5] Creating Manual Soil Report..." -ForegroundColor Yellow
$soilData = @{
    nitrogen = 90
    phosphorus = 42
    potassium = 43
    ph = 6.5
    temperature = 25
    humidity = 70
    rainfall = 150
} | ConvertTo-Json

try {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $soilResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/soil/manual" `
        -Method Post `
        -Headers $headers `
        -Body $soilData
    
    $reportId = $soilResponse._id
    Write-Host "✅ Soil report created successfully" -ForegroundColor Green
    Write-Host "   Report ID: $reportId" -ForegroundColor Gray
    Write-Host "   Soil Health Score: $($soilResponse.soilHealthScore)" -ForegroundColor Gray
    Write-Host "   Soil Health Grade: $($soilResponse.soilHealthGrade)" -ForegroundColor Gray
    Write-Host "   Recommended Crop: $($soilResponse.recommendedCrop)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Soil report creation failed: $_" -ForegroundColor Red
    Write-Host "Error details: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 6: Get Recommendations
Write-Host "[TEST 6] Getting Recommendations..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    
    $recResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/recommendations/$reportId" `
        -Method Get `
        -Headers $headers
    
    Write-Host "✅ Recommendations retrieved successfully" -ForegroundColor Green
    Write-Host "   Crop: $($recResponse.crop)" -ForegroundColor Gray
    Write-Host "   Confidence: $($recResponse.confidence)%" -ForegroundColor Gray
    Write-Host "   Fertilizer Type: $($recResponse.fertilizerRecommendation.type)" -ForegroundColor Gray
    Write-Host "   Fertilizer Amount: $($recResponse.fertilizerRecommendation.amount)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Getting recommendations failed: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 7: Get All Reports
Write-Host "[TEST 7] Getting All Soil Reports..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    
    $reportsResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/soil/reports" `
        -Method Get `
        -Headers $headers
    
    Write-Host "✅ Retrieved $($reportsResponse.Count) soil report(s)" -ForegroundColor Green
} catch {
    Write-Host "❌ Getting reports failed: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ALL TESTS PASSED! ✅" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "System is fully operational!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "FastAPI: http://localhost:8000" -ForegroundColor Cyan
Write-Host ""
