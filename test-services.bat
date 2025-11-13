@echo off
echo ========================================
echo Testing E-Commerce Microservices
echo ========================================
echo.

echo [1/5] Checking Service Discovery (Eureka)...
curl -s http://localhost:8761/actuator/health >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] Service Discovery is running on port 8761
) else (
    echo [ERROR] Service Discovery is NOT running on port 8761
)
echo.

echo [2/5] Checking if Catalogue Service is registered with Eureka...
echo Visit http://localhost:8761 to see registered services
echo.

echo [3/5] Checking Catalogue Service directly...
curl -s http://localhost:8082/products >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] Catalogue Service is running on port 8082
) else (
    echo [ERROR] Catalogue Service is NOT running on port 8082
)
echo.

echo [4/5] Checking API Gateway...
curl -s http://localhost:8081/actuator/health >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] API Gateway is running on port 8081
) else (
    echo [ERROR] API Gateway is NOT running on port 8081
)
echo.

echo [5/5] Checking RabbitMQ...
curl -s http://localhost:15672 >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] RabbitMQ Management UI is accessible on port 15672
    echo     URL: http://localhost:15672 (user: guest, password: guest)
) else (
    echo [ERROR] RabbitMQ is NOT running on port 15672
)
echo.

echo ========================================
echo Test Complete
echo ========================================
echo.
echo Next steps:
echo 1. Make sure all services are running (see above)
echo 2. Wait 10-20 seconds for services to register with Eureka
echo 3. Check Eureka dashboard: http://localhost:8761
echo 4. Test POST: http://localhost:8081/api/v1/products
echo 5. Check RabbitMQ exchanges: http://localhost:15672/#/exchanges
echo.
pause

