@echo off
echo Running seed script to create default users...
node backend/seed.js
echo.
echo Default users created:
echo Admin: admin@portal.com / admin123
echo Student: student@test.com / student123
echo Company: company@test.com / company123
echo.
pause