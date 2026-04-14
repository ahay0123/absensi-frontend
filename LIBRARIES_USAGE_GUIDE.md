# System Presensi - New Libraries & Utilities Documentation

## Overview

Library baru yang dibuat untuk support **long-term maintenance** dan **easy updates**:

| Library                 | Purpose                      | Location |
| ----------------------- | ---------------------------- | -------- |
| `presensi-types.ts`     | All TypeScript types & enums | `/lib/`  |
| `presensi-api.ts`       | API calls + error handling   | `/lib/`  |
| `use-presensi-state.ts` | State management (reducer)   | `/lib/`  |
| `use-camera-qr.ts`      | Camera & QR scanner hooks    | `/lib/`  |
| `use-ngrok.ts`          | Ngrok monitoring & recovery  | `/lib/`  |

---

## 1. presensi-types.ts

**Purpose:** Single source of truth untuk semua types digunakan di presensi system.

```typescript
import type {
  // State types
  Schedule,
  LocationData,
  ErrorState,
  PresentiState,
  PresensiAction,

  // Enums
  ErrorCode,
  Step,
  AttendanceType,

  // Config types
  PresentiConfig,
  FetchScheduleOptions,
  RetryConfig,

  // API types
  SubmitAttendancePayload,
} from "@/lib/presensi-types";
```

### Key Types

**ErrorCode Enum** - All possible errors:

```typescript
enum ErrorCode {
  SCHEDULE_NOT_FOUND = "SCHEDULE_NOT_FOUND",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NETWORK_ERROR = "NETWORK_ERROR",
  NETWORK_TIMEOUT = "NETWORK_TIMEOUT",
  SERVER_ERROR = "SERVER_ERROR",
  INVALID_RESPONSE = "INVALID_RESPONSE",
  GPS_ERROR = "GPS_ERROR",
  CAMERA_ERROR = "CAMERA_ERROR",
  QR_SCANNER_ERROR = "QR_SCANNER_ERROR",
  SUBMISSION_ERROR = "SUBMISSION_ERROR",
  UNKNOWN = "UNKNOWN",
}
```

**PresentiState** - Complete state structure:

```typescript
interface PresentiState {
  step: Step;
  schedule: Schedule | null;
  location: LocationData | null;
  qrData: string | null;
  selfieBlob: Blob | null;
  loading: boolean;
  submitting: boolean;
  canCheckOut: boolean;
  checkInStatus: boolean;
  checksOutTime: string;
  error: ErrorState | null;
}
```

---

## 2. presensi-api.ts

**Purpose:** All API operations dengan robust error handling & retry logic.

### Key Functions

#### `detectErrorCode(error: any): ErrorCode`

Map error object ke specific ErrorCode:

```typescript
const errorCode = detectErrorCode(err);
// Returns: ErrorCode.SCHEDULE_NOT_FOUND | UNAUTHORIZED | etc
```

#### `createErrorState(error, context): ErrorState`

Create user-friendly error state:

```typescript
const errorState = createErrorState(err, "Schedule Fetch");
// Returns: { code, message, details, retryable, timestamp }
```

#### `retryWithBackoff<T>(fn, config, context): Promise<T>`

Retry function dengan exponential backoff:

```typescript
const data = await retryWithBackoff(
  () => api.get("/schedule/33"),
  { maxAttempts: 3, delayMs: 1000, backoffMultiplier: 2 },
  "Fetch Schedule",
);
```

Retry automatically dengan delay:

- Attempt 1 fails → wait 1s → retry
- Attempt 2 fails → wait 2s → retry
- Attempt 3 fails → throw error

#### `fetchScheduleWithValidation(scheduleId, options): Promise<Schedule>`

**Comprehensive schedule fetch** dengan 4 layers validation:

1. **Pre-flight**: Token exists & valid
2. **API Call**: Dengan retry logic
3. **Response Validation**: Check response struktur
4. **Data Integrity**: Ensure semua required fields ada

```typescript
try {
  const schedule = await fetchScheduleWithValidation("33");
  // schedule.id, schedule.room, schedule.start_time, etc guaranteed
} catch (err) {
  // Already comprehensive error logged + typed
  const errorState = createErrorState(err);
}
```

#### `submitAttendance(payload): Promise<any>`

Submit attendance dengan error validation:

```typescript
const response = await submitAttendance({
  schedule_id: "33",
  attendance_type: "check_in",
  qr_payload: "QR_DATA",
  photo: blob,
  lat_check: -6.2,
  long_check: 107.0,
  gps_accuracy: 5,
});
```

#### `requestGPSLocation(timeout): Promise<{lat, long, accuracy}>`

Get GPS location dengan timeout:

```typescript
const location = await requestGPSLocation(10000); // 10s timeout
// { lat: -6.2, long: 107.0, accuracy: 5 }
```

Throws error kalau:

- Browser tidak support geolocation
- User deny location permission
- Request timeout

#### `validatePreFlight(): {valid, error?}`

Pre-flight check sebelum any API call:

```typescript
const check = validatePreFlight();
if (!check.valid) {
  // check.error berisi detail error
  console.error(check.error);
}
```

---

## 3. use-presensi-state.ts

**Purpose:** Centralized state management dengan reducer pattern.

### Usage

```typescript
import { usePresentiState } from "@/lib/use-presensi-state";

function MyComponent() {
  const prsensi = usePresentiState();

  // Access state
  console.log(prsensi.state.schedule);
  console.log(prsensi.state.error);
  console.log(prsensi.state.step);

  // Update state via actions
  prsensi.setSchedule(data);
  prsensi.setError(errorState);
  prsensi.setStep("selfie");
  prsensi.setLocation(location);
  prsensi.setQRData(qr);
  prsensi.setSelfie(blob);
  prsensi.setCheckInStatus(true);
  prsensi.setLoading(false);
  prsensi.setSubmitting(false);
  prsensi.clearError();
  prsensi.reset();

  // Computed properties (read-only)
  if (prsensi.isCheckInMode) {
    /* ... */
  }
  if (prsensi.isCheckOutMode) {
    /* ... */
  }
  if (prsensi.hasLocation) {
    /* ... */
  }
  if (prsensi.hasError) {
    /* ... */
  }
  if (prsensi.isReady) {
    /* has location, qr, selfie */
  }

  // Config
  const timeout = prsensi.config.gpsTimeout;
  const checkoutLead = prsensi.config.checkoutLeadTimeMinutes;
}
```

### Customize Config

```typescript
const prsensi = usePresentiState({
  checkoutLeadTimeMinutes: 20, // 15 by default
  gpsTimeout: 15000, // 10000 by default
  gpsMaxRetries: 5, // 3 by default
  apiRetryAttempts: 4, // 3 by default
  apiRetryDelayMs: 1500, // 1000 by default
  maxPhotoSize: 3 * 1024 * 1024, // 5MB by default
});
```

---

## 4. use-camera-qr.ts

**Purpose:** Manage camera & QR scanner lifecycle + resource cleanup.

### Hook: useCamera

```typescript
import { useCamera } from "@/lib/use-camera-qr";

const videoRef = useRef<HTMLVideoElement>(null);
const { startCamera, stopCamera, cameraState, streamRef } = useCamera(videoRef);

// Start camera
await startCamera();
// cameraState.isActive === true
// cameraState.hasPermission === true
// videoRef.current.srcObject === MediaStream

// Stop camera (automatic cleanup on unmount)
stopCamera();
```

### Hook: useQRScanner

```typescript
import { useQRScanner } from "@/lib/use-camera-qr";

const {
  initQRScanner,
  stopQRScanner,
  pauseQRScanner,
  resumeQRScanner,
  isScanning,
  scanError,
} = useQRScanner(
  "qr-reader", // container ID
  (qrText) => {
    /* on success */
  },
  (error) => {
    /* on error */
  },
);

// Initialize scanner
await initQRScanner();

// Pause/resume if needed
await pauseQRScanner();
await resumeQRScanner();

// Stop (automatic on unmount)
stopQRScanner();
```

### Hook: usePhotoCaptureCanvas

```typescript
import { usePhotoCaptureCanvas } from "@/lib/use-camera-qr";

const videoRef = useRef<HTMLVideoElement>(null);
const canvasRef = useRef<HTMLCanvasElement>(null);

const { capturePhoto, resetPhoto, capturedPhoto, photoError } =
  usePhotoCaptureCanvas(canvasRef, videoRef);

// Capture photo
try {
  const blob = await capturePhoto();
  // blob is JPEG photo with mirror effect
} catch (err) {
  console.error(err);
  // photoError has detail
}
```

### Utility: validatePhotoSize

```typescript
import { validatePhotoSize } from "@/lib/use-camera-qr";

const validation = validatePhotoSize(blob, 5 * 1024 * 1024);
if (!validation.valid) {
  console.error(validation.message); // "Ukuran foto terlalu besar"
}
```

---

## 5. use-ngrok.ts

**Purpose:** Monitor ngrok tunnel health, detect failures, provide recovery steps.

### Hook: useNgrokMonitoring

```typescript
import { useNgrokMonitoring } from "@/lib/use-ngrok";

const ngrok = useNgrokMonitoring({
  checkIntervalMs: 30000, // Check every 30s
  timeoutMs: 5000, // 5s timeout per check
  retryAttempts: 3,
});

// Status
console.log(ngrok.status);
// { isConnected, urlValid, lastChecked, error }

// Health check
if (ngrok.isHealthy) {
  // ngrok aktif & responsive
}

// Manual check
await ngrok.manualCheck();
```

### Hook: useNgrokErrorRecovery

```typescript
import { useNgrokErrorRecovery } from "@/lib/use-ngrok";

const { getRecoverySteps } = useNgrokErrorRecovery();

if (error) {
  const recovery = getRecoverySteps(error);
  // recovery.title
  // recovery.steps (array of steps)
  // recovery.moreInfo

  // Display ke user
  console.log(recovery.title);
  recovery.steps.forEach((step) => console.log(step));
}
```

### Utility: logNgrokDebugInfo

```typescript
import { logNgrokDebugInfo } from "@/lib/use-ngrok";

logNgrokDebugInfo("Schedule Fetch Failed", {
  scheduleId: 33,
  latency: 5000,
  attempts: 3,
});

// Logs dengan context:
// - timestamp
// - current base URL
// - token existence
// - custom data
```

### Utility: validateNgrokSetup

```typescript
import { validateNgrokSetup } from "@/lib/use-ngrok";

const { errors, warnings, isValid } = validateNgrokSetup();

if (!isValid) {
  errors.forEach((err) => console.error(err));
}
warnings.forEach((warn) => console.warn(warn));
```

---

## How to Extend (For Developers)

### Add New Error Type

**Step 1:** Add to ErrorCode enum

```typescript
// lib/presensi-types.ts
enum ErrorCode {
  MY_CUSTOM_ERROR = "MY_CUSTOM_ERROR",
  // ...existing
}
```

**Step 2:** Add detection logic

```typescript
// lib/presensi-api.ts
function detectErrorCode(error) {
  if (error.myCustomCondition) {
    return ErrorCode.MY_CUSTOM_ERROR;
  }
  // ...existing
}
```

**Step 3:** Add message mapping

```typescript
// lib/presensi-api.ts
function createErrorState(error, context) {
  let message = "default";

  switch (code) {
    case ErrorCode.MY_CUSTOM_ERROR:
      message = "Custom error message";
      break;
    // ...existing
  }
}
```

**Done!** Component automatically handles new error type.

### Add New API Endpoint

```typescript
// lib/presensi-api.ts
export async function fetchMyData(id: string) {
  const context = `Fetch My Data ${id}`;

  // Pre-flight
  const preflight = validatePreFlight();
  if (!preflight.valid) throw preflight.error;

  // Fetch dengan retry
  const response = await retryWithBackoff(
    () => api.get(`/my-endpoint/${id}`),
    { maxAttempts: 3 },
    context,
  );

  // Validate response
  const data = response.data?.data || response.data;
  if (!data) throw new Error("Invalid response");

  return data;
}

// In component:
try {
  const data = await fetchMyData(id);
  prsensi.setSchedule(data);
} catch (err) {
  const errorState = createErrorState(err);
  prsensi.setError(errorState);
}
```

### Add New State Field

```typescript
// 1. Update type definition
// lib/presensi-types.ts
interface PresentiState {
  // ...existing
  myNewField: string; // Add here
}

interface PresensiAction {
  type: PresensiActionType;
  // Adjust types as needed
}

type PresensiActionType =
  | 'SET_MY_NEW_FIELD' // Add here
  | // ...existing

// 2. Update reducer
// lib/use-presensi-state.ts
function presentiReducer(state, action) {
  switch (action.type) {
    case 'SET_MY_NEW_FIELD':
      return { ...state, myNewField: action.payload };
    // ...existing
  }
}

// 3. Add dispatch wrapper
// lib/use-presensi-state.ts
const setMyNewField = useCallback((value: string) => {
  dispatch({ type: 'SET_MY_NEW_FIELD', payload: value });
}, []);

// 4. Return from hook
return {
  // ...existing
  setMyNewField,
};

// 5. Use in component
prsensi.setMyNewField('value');
console.log(prsensi.state.myNewField);
```

---

## Best Practices

### 1. Always Use Provided Utilities

❌ **Don't:**

```typescript
try {
  const res = await fetch(url);
  const data = await res.json();
} catch (err) {
  setError("Failed");
}
```

✅ **Do:**

```typescript
try {
  const data = await fetchScheduleWithValidation(id);
} catch (err) {
  const errorState = createErrorState(err);
  prsensi.setError(errorState);
}
```

### 2. Centralize State with usePresentiState

❌ **Don't:**

```typescript
const [schedule, setSchedule] = useState(null);
const [qr, setQr] = useState(null);
const [location, setLocation] = useState(null);
const [error, setError] = useState(null);
// ... 10 more useState
```

✅ **Do:**

```typescript
const prsensi = usePresentiState();
// Single state object, clear actions, computed properties
```

### 3. Cleanup Resources Properly

✅ **Use hooks for automatic cleanup:**

```typescript
const { startCamera, stopCamera } = useCamera(videoRef);
// Auto cleanup on unmount

const { initQRScanner, stopQRScanner } = useQRScanner(...);
// Auto cleanup on unmount
```

### 4. Error Handling Pattern

✅ **Consistent error handling:**

```typescript
try {
  // Do something
} catch (err: any) {
  const errorState = createErrorState(err, "Context");
  prsensi.setError(errorState);
  showAlert("error", errorState.message);
}
```

### 5. Logging Format

✅ **Follow established logging prefix:**

```typescript
console.log("📚 [Presensi] Schedule loaded");
console.log("❌ [Error] Failed to submit");
console.log("🔍 [Ngrok] Connection check");
```

---

## Testing

### Unit Testing Utility Functions

```typescript
import {
  detectErrorCode,
  createErrorState,
  validatePhotoSize,
} from "@/lib/presensi-api";

describe("presensi-api", () => {
  test("detectErrorCode maps 404 to SCHEDULE_NOT_FOUND", () => {
    const error = { response: { status: 404 } };
    expect(detectErrorCode(error)).toBe(ErrorCode.SCHEDULE_NOT_FOUND);
  });

  test("validatePhotoSize rejects large files", () => {
    const largeBlob = new Blob(["x".repeat(6 * 1024 * 1024)]);
    const result = validatePhotoSize(largeBlob, 5 * 1024 * 1024);
    expect(result.valid).toBe(false);
  });
});
```

### Integration Testing

```typescript
// Test full flow
import { renderHook, act } from "@testing-library/react";
import { usePresentiState } from "@/lib/use-presensi-state";

describe("Presensi Flow", () => {
  test("Complete check-in flow", async () => {
    const { result } = renderHook(() => usePresentiState());

    act(() => {
      result.current.setStep("qr_scan");
    });
    expect(result.current.state.step).toBe("qr_scan");

    // ... continue testing
  });
});
```

---

## Troubleshooting Development Issues

### "Module not found: presensi-api"

```bash
# Check file exists:
ls -la src/lib/presensi-api.ts

# Clear Next.js cache:
rm -rf .next
npm run dev
```

### "Type error: Cannot find name 'Schedule'"

```typescript
// Make sure to import types:
import type { Schedule, ErrorState } from "@/lib/presensi-types";
```

### "usePresentiState expects config but I didn't provide"

```typescript
// All config optional - defaults applied:
const prsensi = usePresentiState(); // Uses all defaults
const prsensi = usePresentiState({ checkoutLeadTimeMinutes: 20 }); // Override specific
```

---

## Version History

| Version | Date     | Changes                                |
| ------- | -------- | -------------------------------------- |
| 2.0.0   | Apr 2026 | Complete refactor dengan new libraries |
| 1.0.0   | Jan 2026 | Original system                        |

---

**Last Updated:** April 2026
**Maintained By:** Development Team
**Status:** ✅ Production Ready
