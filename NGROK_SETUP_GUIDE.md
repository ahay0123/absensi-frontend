# NGROK Setup & Verification Guide

Panduan lengkap untuk setup backend dengan ngrok dan verify semuanya bekerja.

## Prerequisites

- Node.js installed (frontend)
- PHP & Composer installed (backend Laravel)
- Ngrok installed ([download](https://ngrok.com/download))
- Terminal/Command Prompt
- Valid login credentials untuk test

## Step 1: Start Backend Laravel (Terminal 1)

```bash
# Navigate ke backend project
cd path/to/backend

# Install dependencies (kalau blm)
composer install

# Setup environment
cp .env.example .env
php artisan key:generate

# Run migrations (pastikan DB connected)
php artisan migrate

# Start Laravel dev server
php artisan serve --host=127.0.0.1 --port=8000
```

**Expected Output:**

```
Laravel development server started: http://127.0.0.1:8000
```

✅ **Verify:** Open http://127.0.0.1:8000 di browser → should return Laravel response

---

## Step 2: Start Ngrok Tunnel (Terminal 2)

```bash
# From anywhere, start ngrok tunnel ke localhost:8000
ngrok http 8000
```

**Expected Output:**

```
Session Status                online
Account                       your-email@example.com
Version                        3.0.0
Region                         us (United States)
Latency                        0.00ms
Web Interface                  http://127.0.0.1:4040
Forwarding                     https://abc123def456.ngrok-free.dev -> http://127.0.0.1:8000

Connections                    ttl     opn     rt1     rt5     p50     p90
                               0       0       0.00    0.00    0.00    0.00
```

**Copy this URL → You'll need it:** `https://abc123def456.ngrok-free.dev`

✅ **Verify:**

```bash
# Terminal 3 - Test ngrok works
curl https://abc123def456.ngrok-free.dev/api/

# Should return: {"message":"Unauthenticated."} or similar
```

---

## Step 3: Update Frontend .env (Frontend Project)

**File:** `frontend-absensi/.env.local`

```env
# Replace with YOUR ngrok URL from Terminal 2
NEXT_PUBLIC_API_URL=https://abc123def456.ngrok-free.dev/api
```

Save file.

---

## Step 4: Start Frontend Dev Server (Terminal 3)

```bash
# Navigate ke frontend project
cd frontend-absensi

# Kill existing node processes (if running)
# Windows:
taskkill /F /IM node.exe

# Linux/Mac:
pkill node

# Clean build cache
rm -rf .next

# Start dev server dengan hostname 0.0.0.0 (for mobile access)
npm run dev -- --hostname 0.0.0.0 --port 3000
```

**Expected Output:**

```
▲ Next.js 16.x.x
- Local:        http://localhost:3000
- Environments: .env.local

✓ Ready in 1234ms
```

✅ **Verify:** Open http://localhost:3000 di browser

---

## Step 5: Login & Test

1. Open http://localhost:3000
2. Login dengan credentials yang valid
3. Navigate ke halaman yang punya /presensi-guru/[id]
4. Buka DevTools (F12) → Console tab

### Check Console for Ngrok Connection

Kalau koneksi bagus, console akan show:

```
✅ [Ngrok] Connected & responsive
📚 [Fetch Schedule 33] Starting fetch with validation
📡 [GET] https://abc123def456.ngrok-free.dev/api/schedules/33
✅ [200] Schedule loaded successfully
```

### Check Ngrok Status Badge

Di UI, kamu harus lihat status badge (top-right):

- 🟢 **Connected** → ngrok aktif & responsive
- 🔴 **Offline** → ngrok tidak response

---

## Step 6: Full Presensi Flow Test

1. Navigate ke presensi page: `/presensi-guru/33` (ganti 33 dengan ID jadwal real)
2. Check status:
   - [ ] Schedule data loaded (bukan 404)
   - [ ] Location permission works
   - [ ] QR Scanner starts
   - [ ] Camera permission works
3. Complete presensi:
   - [ ] Scan QR / Lewati Scan
   - [ ] Take selfie
   - [ ] Submission works
4. Check console:
   - [ ] No errors
   - [ ] All logs dengan prefix [Presensi], [Ngrok], dll
   - [ ] Network requests successful

---

## Troubleshooting

### Issue: "Ngrok connection timeout"

**Symptoms:**

```
❌ [Ngrok] Connectivity check failed: Error: connect ECONNREFUSED
```

**Causes & Solutions:**

1. **Laravel not running** (Terminal 1)

   ```bash
   # Check if Laravel running on port 8000
   lsof -i :8000  # Mac/Linux
   netstat -ano | findstr :8000  # Windows

   # If not, restart:
   cd backend
   php artisan serve --host=127.0.0.1 --port=8000
   ```

2. **Ngrok stopped** (Terminal 2)

   ```bash
   # Restart ngrok:
   ngrok http 8000
   ```

3. **Wrong port**
   - Verify Terminal 1 is on port 8000
   - Verify Terminal 2 is tunneling to 8000

---

### Issue: "New ngrok URL every restart"

**Symptoms:**

```
.env: https://old-url.ngrok-free.dev
ngrok output: https://new-url.ngrok-free.dev
Error: Network failure
```

**Solution:**

1. Stop frontend dev server (Ctrl+C in Terminal 3)
2. Copy NEW URL dari Terminal 2
3. Update `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=https://new-url.ngrok-free.dev/api
   ```
4. Restart frontend:
   ```bash
   npm run dev -- --hostname 0.0.0.0 --port 3000
   ```

---

### Issue: "401 Unauthorized on API calls"

**Symptoms:**

```
❌ [401] UNAUTHORIZED - Token expired
```

**Causes:**

1. Tokenot di localStorage
2. Token format invalid
3. Token expired

**Solutions:**

```javascript
// Check in DevTools Console:
localStorage.getItem("token");
// Should return: "Bearer xxxxxxx..."

// If empty or invalid:
// 1. Logout & Login again
// 2. Refresh page (Ctrl+Shift+R to hard refresh)
// 3. Clear localStorage:
localStorage.clear();
// Then login again
```

---

### Issue: "404 Schedule not found"

**Symptoms:**

```
❌ Jadwal tidak ditemukan atau Anda tidak memiliki akses
Error Code: SCHEDULE_NOT_FOUND
```

**Causes:**

1. Schedule ID tidak valid
2. Schedule dihapus
3. User tidak punya schedule itu (authorization issue)

**Solutions:**

```bash
# Test API directly with token
SCHEDULE_ID=33
TOKEN="Bearer your-token-here"

curl-H "Authorization: $TOKEN" \
  https://abc123def456.ngrok-free.dev/api/schedules/$SCHEDULE_ID

# Response harus:
# - 200: { "id": 33, "room": {...}, ... }
# - 404: { "message": "Not found" }
# - 401: { "message": "Unauthenticated" }
```

---

### Issue: "Safari/iOS terlihat lain"

**Symptoms:**

- UI macet, tidak respond
- Geolocation permission terus minta
- Camera tidak work

**Solutions:**

1. **Clear Safari Cache:**
   - Settings → Safari → Clear History and Website Data
   - Refresh page

2. **Location Permission:**
   - Settings → Safari → Location → Always Allow

3. **Camera Permission:**
   - Settings → Privacy → Camera → Allow

---

### Issue: "Ngrok session expired after 2 hours"

**Symptoms:**

```
⚠️ Session Status: offline
Error: HTTP client error
```

**Cause:** Ngrok free tier: 2 hour session limit

**Solution:** Restart ngrok

```bash
# Terminal 2: Press Ctrl+C
# Wait for graceful shutdown
# Then:
ngrok http 8000

# Copy new URL, update .env.local, restart frontend
```

---

## Mobile Testing Setup

Untuk test di mobile device pada network yang sama:

### Step 1: Find Your Computer IP

**Windows:**

```bash
ipconfig

# Look for "IPv4 Address" under main network adapter
# Example: 192.168.1.227
```

**Mac/Linux:**

```bash
ifconfig

# Look for inet address (not localhost)
# Example: 192.168.1.227
```

### Step 2: Access from Mobile

Mobile device (connected to same WiFi):

```
# Open browser dan go to:
http://192.168.1.227:3000/

# Should load presensi app
```

### Step 3: Verify Ngrok Works from Mobile

Check DevTools on mobile (using remote debugging) or check server logs.

---

## Verify Checklist

Before declaring setup complete:

- [ ] Laravel running on 127.0.0.1:8000
- [ ] Ngrok tunnel active showing URL
- [ ] Frontend .env.local has correct ngrok URL
- [ ] Frontend dev server running on 0.0.0.0:3000
- [ ] Can login to frontend
- [ ] Can load schedule data (no 404)
- [ ] GPS location permission works
- [ ] QR Scanner initializes
- [ ] Camera permission works
- [ ] Can complete full presensi flow
- [ ] Ngrok status badge shows 🟢 Connected
- [ ] Console logs show successful API calls
- [ ] Mobile access works (http://192.168.x.x:3000)

---

## Quick Command Reference

### Terminal 1 (Backend)

```bash
cd path/to/backend
php artisan serve --host=127.0.0.1 --port=8000
```

### Terminal 2 (Ngrok)

```bash
ngrok http 8000
# Copy URL from output
```

### Terminal 3 (Frontend)

```bash
# First time
cd frontend-absensi
npm run dev -- --hostname 0.0.0.0 --port 3000

# After .env.local change
# 1. Stop server (Ctrl+C)
# 2. Restart:
npm run dev -- --hostname 0.0.0.0 --port 3000
```

### Browser (Testing)

```javascript
// DevTools Console - Quick checks
localStorage.getItem('token');                    // Check token
JSON.parse(localStorage.getItem('user'));         // Check user data
${process.env.NEXT_PUBLIC_API_URL}               // Check API URL
navigator.geolocation.getCurrentPosition(...);   // Test GPS
```

---

## When Things Still Don't Work

### Collect Debug Info

```javascript
// DevTools Console:

// 1. API URL
console.log(process.env.NEXT_PUBLIC_API_URL);

// 2. Token
console.log(localStorage.getItem("token"));

// 3. User
console.log(localStorage.getItem("user"));

// 4. Recent logs (network tab)
// F12 → Network tab → refresh → look for failures
```

### Check Backend Logs

```bash
# Terminal 1 - Laravel output
# Look for error messages

# Or file logs:
tail -f path/to/backend/storage/logs/laravel.log
```

### Check Ngrok Logs

```bash
# Terminal 2 - Ngrok output
# Shows all requests passing through

# Web UI (optional):
# Open http://127.0.0.1:4040 to see request history
```

---

## Long-Term Maintenance

### Weekly

- [ ] Verify ngrok still running when restarting
- [ ] Check for new ngrok URL & update .env if needed
- [ ] Monitor console logs for new errors

### When Deploying

- [ ] Update ngrok URL if changed
- [ ] Restart all 3 terminals in order:
  1. Backend (Terminal 1)
  2. Ngrok (Terminal 2)
  3. Frontend (Terminal 3)
- [ ] Verify all 3 are running
- [ ] Test full presensi flow
- [ ] Check console for errors

---

**Last Updated:** April 2026
**Version:** 1.0.0
