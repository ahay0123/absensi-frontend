#!/bin/bash
# Frontend Quick Start for Assessment Category Feature

## ===== STEP 1: Frontend Setup =====
echo "🚀 Setting up Frontend..."
cd c:\Project-absen\frontend-absensi

echo "✅ Frontend setup complete!"
echo "📖 Files created:"
echo "   - src/app/admin/assessment-categories/page.tsx"
echo "   - Updated src/components/AdminLayout.tsx (added menu)"
echo "   - Updated src/app/globals.css (added slideIn animation)"
echo ""

## ===== STEP 2: Start Frontend Server =====
echo "🔧 Starting Next.js Development Server..."
echo "⏳ Make sure backend is running on localhost:8000"
npm run dev

# This will run on http://localhost:3000
# Login as Admin and navigate to /admin/assessment-categories
