# REFACTORED PRESENSI SYSTEM - Complete Guide

## Overview

Sistem presensi telah di-refactor dengan **improved architecture** yang lebih robust, maintainable, dan siap untuk production long-term.

### Key Improvements

1. **Better State Management** - Dari 10+ useState → Single reducer pattern dengan usePresentiState
2. **Comprehensive Error Handling** - Retry logic, pre-flight validation, multi-level error detection
3. **Resource Management** - Proper cleanup hooks untuk camera, QR scanner, timers
4. **Ngrok-Specific Support** - Built-in monitoring untuk ngrok tunnel health & recovery steps
5. **Easier Debugging** - Detailed logging, error codes, recovery suggestions untuk users
6. **Maintainability** - Clean separation of concerns: hooks, utilities, components

---

## Architecture

### File Structure

```
src/
├── lib/
│   ├── presensi-types.ts       # All TypeScript types & interfaces
│   ├── presensi-api.ts         # API calls + error handling + retry logic
│   ├── use-presensi-state.ts   # State management hook (reducer pattern)
│   ├── use-camera-qr.ts        # Camera & QR scanner hooks
│   ├── use-ngrok.ts            # Ngrok-specific monitoring & recovery
│   └── axios.tsx               # Axios configuration
│
└── app/presensi-guru/[id]/
    └── page.tsx                # Main page component (refactored)
```

### State Structure (usePresentiState)

```typescript
interface PresentiState {
  // Navigation
  step: 'info' | 'qr_scan' | 'selfie' | 'processing' | 'success' | 'error'

  // Data
  schedule: Schedule | null
  location: LocationData | null
  qrData: string | null
  selfieBlob: Blob | null

  // Status
  loading: boolean
  submitting: boolean
  canCheckOut: boolean
  checkInStatus: boolean
  checksOutTime: string

  // Error
  error: ErrorState | null (with code, message, details, retryable flag)
}
```

---

## Root Causes Identified & Fixed

| #   | Issue                      | Root Cause                                | Solution                             | Status |
| --- | -------------------------- | ----------------------------------------- | ------------------------------------ | ------ |
| 1   | Redirect to dashboard      | Hardcoded ngrok URL bisa berubah          | Added ngrok monitoring & auto-detect | ✅     |
| 2   | Silent failure             | Tidak ada pre-flight validation           | Added token check sebelum API call   | ✅     |
| 3   | Race conditions            | Multiple useEffect bisa trigger bersamaan | Centralized state dengan reducer     | ✅     |
| 4   | API response handling      | Hanya assume 2 format response            | Handle 3+ format dengan fallback     | ✅     |
| 5   | No retry logic             | Network timeout = langsung error          | Added exponential backoff retry      | ✅     |
| 6   | Token expired not detected | Barulah tahu setelah request              | Pre-flight validation check token    | ✅     |
| 7   | State management chaos     | 10+ useState tidak sinkron                | Single reducer state dengan actions  | ✅     |
| 8   | GPS silently fails         | Location check terlalu lax                | Validate location sebelum submit     | ✅     |

---

## Key Features

### 1. Auto-Retry with Exponential Backoff

```typescript
// API calls automatically retry dengan delay:
// Attempt 1: fail → wait 1s
// Attempt 2: fail → wait 2s
// Attempt 3: fail → throw error

retryWithBackoff(
  () => api.get(`/schedules/${id}`),
  { maxAttempts: 3 },
  "Fetch Schedule",
);
```

### 2. Pre-Flight Validation

Sebelum fetch schedule, system check:

- ✅ Token exists & valid format
- ✅ Koneksi network available
- ✅ Ngrok endpoint responsive

Kalau ada issue, user langsung dapat helpful message.

### 3. Multi-Layer Error Detection

```typescript
// Detect error dari:
- HTTP status code (404, 401, 500)
- Network errors (timeout, ERR_NETWORK)
- Response structure validation
- Custom error codes from backend
- Invalid response format
```

### 4. Ngrok Health Monitoring

Backend ngrok tunnel: **dipantau secara realtime**

```typescript
useNgrokMonitoring({
  checkIntervalMs: 30000, // Check setiap 30 detik
  timeoutMs: 5000,
});
```

Visual indicator menunjukkan:

- 🟢 Connected - ngrok aktif & responsive
- 🔴 Offline - ngrok tidak available

### 5. Smart Error Recovery

User tidak hanya lihat error, tapi juga langkah-langkah perbaikan:

```
❌ Gagal Memuat Data
├ Error message (user-friendly)
├ Error code (untuk debugging)
├ Ngrok status (connected/offline)
├ Recovery steps:
│  1. Pastikan ngrok tunnel berjalan
│  2. Check URL ngrok di .env
│  3. Restart development server
│  4. Clear browser cache
└ Retry button atau back button
```

---

## How to Use (For Developers)

### Import & Use State

```typescript
import { usePresentiState } from "@/lib/use-presensi-state";
import { fetchScheduleWithValidation } from "@/lib/presensi-api";

function MyComponent() {
  const prsensi = usePresentiState();

  // Access state
  console.log(prsensi.state.schedule);
  console.log(prsensi.state.error);

  // Update state
  prsensi.setStep("qr_scan");
  prsensi.setSchedule(scheduleData);
  prsensi.setError(errorState);

  // Computed properties
  if (prsensi.isCheckInMode) {
    /* ... */
  }
  if (prsensi.hasError) {
    /* ... */
  }
  if (prsensi.isReady) {
    /* ... */
  }

  // Config access
  console.log(prsensi.config.checkoutLeadTimeMinutes);
}
```

### Fetch Schedule with Validation

```typescript
try {
  const schedule = await fetchScheduleWithValidation(scheduleId);
  prsensi.setSchedule(schedule);
} catch (err) {
  const errorState = createErrorState(err, "context");
  prsensi.setError(errorState);
}
```

### Handle Errors with Recovery

```typescript
const { getRecoverySteps } = useNgrokErrorRecovery();

if (prsensi.state.error) {
  const recovery = getRecoverySteps(prsensi.state.error);
  // recovery.title
  // recovery.steps (array)
  // recovery.moreInfo
}
```

### Monitor Ngrok Health

```typescript
const ngrok = useNgrokMonitoring();

console.log(ngrok.status); // { isConnected, urlValid, lastChecked, error }
console.log(ngrok.isHealthy); // boolean

// Manual check
await ngrok.manualCheck();
```

---

## Configuration

### Customize via usePresentiState

```typescript
const prsensi = usePresentiState({
  checkoutLeadTimeMinutes: 20, // Default: 15
  gpsTimeout: 15000, // Default: 10000ms
  gpsMaxRetries: 5, // Default: 3
  apiRetryAttempts: 4, // Default: 3
  maxPhotoSize: 3 * 1024 * 1024, // Default: 5MB
});
```

### Configure Ngrok Monitoring

```typescript
const ngrok = useNgrokMonitoring({
  checkIntervalMs: 60000, // Default: 30000ms
  timeoutMs: 10000, // Default: 5000ms
  retryAttempts: 5, // Default: 3
});
```

---

## Error Codes Reference

| Code                 | Meaning                      | Retryable | Action                          |
| -------------------- | ---------------------------- | --------- | ------------------------------- |
| `SCHEDULE_NOT_FOUND` | Jadwal tidak ada / no access | ❌        | Check schedule ID & permissions |
| `UNAUTHORIZED`       | Token expired atau invalid   | ❌        | Re-login                        |
| `FORBIDDEN`          | User tidak punya akses       | ❌        | Check user permissions          |
| `NETWORK_ERROR`      | Koneksi terputus             | ✅        | Check internet & ngrok          |
| `NETWORK_TIMEOUT`    | Request timeout              | ✅        | Check ngrok responsiveness      |
| `SERVER_ERROR`       | Backend error (5xx)          | ✅        | Check backend logs              |
| `INVALID_RESPONSE`   | Response format tidak valid  | ❌        | Contact admin                   |
| `GPS_ERROR`          | GPS location failed          | ❌        | Enable location permission      |
| `CAMERA_ERROR`       | Camera access denied         | ❌        | Enable camera permission        |
| `QR_SCANNER_ERROR`   | QR scanner init failed       | ❌        | Refresh & retry                 |
| `SUBMISSION_ERROR`   | Attendance submit failed     | ✅        | Retry atau check data           |

---

## Ngrok Setup & Troubleshooting

### Verify Ngrok is Running

**Terminal 1 (Backend Laravel):**

```bash
# Navigate ke backend Laravel project
cd path/to/backend

# Ensure database & migrations ok
php artisan migrate

# Start Laravel server
php artisan serve --host=127.0.0.1 --port=8000
```

**Terminal 2 (Ngrok tunnel):**

```bash
# Start ngrok tunnel terhadap Laravel server
ngrok http 8000

# Output akan seperti:
# Forwarding   https://xxxx-xxxx-xxxx.ngrok-free.dev -> http://127.0.0.1:8000
# ^ Copy URL ini
```

### Update Frontend .env

**File:** `frontend-absensi/.env.local`

```env
# Copy URL dari ngrok output di atas
NEXT_PUBLIC_API_URL=https://xxxx-xxxx-xxxx.ngrok-free.dev/api
```

### Restart Frontend Dev Server

```bash
# Terminal 3 (Frontend)
cd frontend-absensi

# Stop jika masih running (Ctrl+C)
# Clean cache
rm -rf .next

# Start dengan hostname 0.0.0.0 untuk mobile access
npm run dev -- --hostname 0.0.0.0 --port 3000

# Akan accessible di:
# - http://localhost:3000 (lokal)
# - http://192.168.x.x:3000 (mobile pada network yang sama)
```

### Verify Everything Works

```bash
# Terminal 4: Test API endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://xxxx-xxxx-xxxx.ngrok-free.dev/api/schedules/33

# Response harus berisi schedule data
```

### Common Ngrok Issues

**Issue: "ngrok session has expired"**

- Ngrok free tier: Session expires setelah 2 jam
- **Solution:** Restart ngrok tunnel
  ```bash
  # Press Ctrl+C in ngrok terminal
  ngrok http 8000  # Start again
  ```

**Issue: New URL after ngrok restart**

- Ngrok assigns new URL setiap restart
- **Solution:**
  1. Copy new URL dari ngrok output
  2. Update `.env.local` di frontend
  3. Restart frontend dev server: `npm run dev`

**Issue: "Failed to connect to ngrok"**

- Laravel server mungkin tidak running
- **Solution:** Check Terminal 1, restart Laravel:
  ```bash
  php artisan serve --host=127.0.0.1 --port=8000
  ```

**Issue: "Browser warning from ngrok"**

- Ngrok shows browser warning page
- **Solution:** Already handled - axios header `ngrok-skip-browser-warning` is set

**Issue: "CORS errors"**

- Frontend & backend CORS mismatch
- **Solution:** Ensure backend `CORS` middleware allows ngrok origin
  ```php
  // config/cors.php - ensure ngrok URL in allowed_origins
  'allowed_origins' => ['*'],  // or specific ngrok domain
  ```

---

## Deployment Checklist

- [ ] Backend Laravel running dengan ngrok tunnel
- [ ] Ngrok URL dikopy ke `.env.local` di frontend
- [ ] Frontend dev server restarted (`npm run dev -- --hostname 0.0.0.0`)
- [ ] User logged in dengan valid token
- [ ] Ngrok browser warning handled (header set in axios)
- [ ] Test API endpoint dengan curl & token
- [ ] Browser console check untuk logging
- [ ] Ngrok status badge shows "Connected" (🟢)

---

## Logging & Debugging

### Enable Detailed Logging

Sistem sudah punya built-in verbose logging dengan prefix:

```
📚 [Presensi] - Schedule operations
📡 [API] - Network requests
🔍 [Ngrok] - Ngrok-specific issues
📷 [Camera] - Camera/video operations
📱 [QR Scanner] - QR code scanning
❌ [Error] - Error conditions
✅ [Success] - Successful operations
```

### Check Browser Console

Open DevTools (F12) → Console tab

Normal flow akan terlihat:

```
📚 [Fetch Schedule 33] Starting fetch with validation
✅ [Presensi] Schedule loaded successfully: …
📍 Requesting GPS location…
✅ GPS Location obtained: …
📱 [QR Scanner] Initialized successfully
✅ [QR] Scanned successfully
📤 [POST] /test-absen
✅ Attendance submitted successfully
```

### Server-Side Debug

**Backend Laravel logs:**

```bash
# Terminal - follow Laravel logs
tail -f storage/logs/laravel.log

# Atau buka file:
# storage/logs/laravel-YYYY-MM-DD.log
```

---

## When to Update This Code

### Easy Updates (Low Risk)

- ✅ Change timeout values
- ✅ Change checkout lead time
- ✅ Change error messages
- ✅ Add new error codes to ErrorCode enum
- ✅ Modify UI styling

### Medium Updates (Test Before)

- ⚠️ Change API endpoints
- ⚠️ Add new validation rules
- ⚠️ Change state structure (add new fields)
- ⚠️ Modify error recovery steps

### Major Refactoring (Review Architecture)

- 🔴 Change state management approach
- 🔴 Change how API calls are made
- 🔴 Change when/how cleanup happens
- 🔴 Modify resource lifecycle

---

## Quick Reference

### Most Common Tasks

**Task: Handle new error type**

```typescript
// 1. Add to ErrorCode enum (presensi-types.ts)
enum ErrorCode {
  MY_NEW_ERROR = "MY_NEW_ERROR",
  // ...
}

// 2. Add detection (presensi-api.ts)
function detectErrorCode(error) {
  if (error.response?.status === 418) {
    return ErrorCode.MY_NEW_ERROR;
  }
  // ...
}

// 3. Add message mapping (presensi-api.ts)
switch (code) {
  case ErrorCode.MY_NEW_ERROR:
    message = "User-friendly message";
    break;
}

// 4. Component automatically handles it
```

**Task: Change API endpoint**

```typescript
// presensi-api.ts
- const response = await retryWithBackoff(
-   () => api.get(`/schedules/${scheduleId}`),
-   ...
- )

+ const response = await retryWithBackoff(
+   () => api.get(`/new-endpoint/${scheduleId}`),
+   ...
+ )
```

**Task: Add field to submission**

```typescript
// presensi-types.ts
interface SubmitAttendancePayload {
  // ...existing fields
  myNewField: string;
}

// presensi-api.ts
formData.append("my_new_field", payload.myNewField);

// page.tsx
await submitAttendance({
  // ...
  myNewField: "value",
});
```

---

## Support & Contact

- **Issue:** Check error code in console
- **Debug:** Follow logging in DevTools Console
- **Troubleshoot:** Check recovery steps in error UI
- **Contact Admin:** When issue persists after all recovery attempts

---

**Last Updated:** April 2026
**Version:** 2.0.0 (Refactored)
**Status:** ✅ Ready for Production Long-Term Use
