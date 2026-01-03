#!/bin/bash

# VerseAI Startup Script
echo "🚀 Starting VerseAI Application..."
echo ""

# Start backend in background
echo "📦 Starting Backend Server (port 5000)..."
cd backend
npm start > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "⚛️  Starting Frontend Server (port 3000)..."
npm start &
FRONTEND_PID=$!

echo ""
echo "✅ Servers starting..."
echo "📝 Backend PID: $BACKEND_PID"
echo "📝 Frontend PID: $FRONTEND_PID"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for user interrupt
wait

