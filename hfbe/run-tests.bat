@echo off
echo === COCONATURE E-COMMERCE TEST SUITE ===
echo Running tests and saving output to logs...

REM Create logs directory if it doesn't exist
if not exist logs mkdir logs

echo.
echo === STEP 1: Testing MongoDB connection ===
node scripts/test-mongodb.js > logs/mongodb-connection.log 2>&1
echo MongoDB connection test completed. See logs/mongodb-connection.log for details.

echo.
echo === STEP 2: Running fixed test scenario ===
node scripts/fixed-test-scenario.js > logs/test-scenario.log 2>&1
echo Test scenario completed. See logs/test-scenario.log for details.

echo.
echo === STEP 3: Running improved validation ===
node scripts/improved-validation.js > logs/improved-validation.log 2>&1
echo Validation completed. See logs/improved-validation.log for details.

echo.
echo === STEP 4: Running updated test runner ===
node scripts/updated-test-runner.js > logs/test-runner.log 2>&1
echo Test runner completed. See logs/test-runner.log for details.

echo.
echo === All tests completed. ===
echo Check the logs folder for detailed results.
