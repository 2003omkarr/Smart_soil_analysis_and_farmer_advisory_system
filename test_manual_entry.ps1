# Test Manual Entry Workflow
Write-Host "Testing Manual Soil Entry..." -ForegroundColor Cyan

# Register a new user
$registerData = @{
    name = "Test User $(Get-Random -Maximum 1000)"
    email = "test$(Get-Random -Maximum 10000)@example.com"
    phone = "1234567890"
    location = "Test Location"
    password = "password123"
    role = "farmer"
} | ConvertTo-Json

Write-Host "Registering user..." -ForegroundColor Yellow
$registerResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
    -Method Post `
    -ContentType "application/json" `
    -Body $registerData

$token = $registerResponse.token
Write-Host "✅ User registered. Token: $($token.Substring(0, 20))..." -ForegroundColor Green

# Submit manual soil data
$soilData = @{
    nitrogen = 90
    phosphorus = 42
    potassium = 43
    ph = 6.5
    temperature = 25
    humidity = 70
    rainfall = 150
} | ConvertTo-Json

Write-Host "`nSubmitting manual soil data..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $soilResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/soil/manual" `
        -Method Post `
        -Headers $headers `
        -Body $soilData
    
    Write-Host "✅ Soil data submitted successfully!" -ForegroundColor Green
    Write-Host "   Report ID: $($soilResponse.reportId)" -ForegroundColor Gray
    Write-Host "   Recommended Crop: $($soilResponse.report.recommendedCrop)" -ForegroundColor Gray
    Write-Host "   Soil Health Score: $($soilResponse.report.soilHealthScore)" -ForegroundColor Gray
    Write-Host "   Soil Health Grade: $($soilResponse.report.soilHealthGrade)" -ForegroundColor Gray
    Write-Host "   Confidence: $($soilResponse.report.recommendation.confidence)%" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}
