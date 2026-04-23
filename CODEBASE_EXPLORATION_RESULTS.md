# Codebase Exploration Results

**Generated: April 22, 2026**

---

## 1. ADMIN ATTENDANCE/ABSENSI PAGES

### Main Attendance Management Page

**File:** [src/app/admin/attendances/page.tsx](src/app/admin/attendances/page.tsx)

**Features:**

- Display attendance records in a data table
- Real-time search by teacher name
- Filter by date range (start date & end date)
- Filter by attendance status (Hadir, Terlambat, Izin/Sakit, Alpa)
- Pagination support
- View evidence (location/map data)
- Edit attendance status via modal
- Delete attendance records

**Data Displayed:**

- Teacher name with NIP
- Validation time (tap_time_formatted)
- Attendance status with colored badges
- Schedule information (room name, day, time)
- Location coordinates evidence

**API Endpoints Used:**

- `GET /admin/attendances?page={page}&start_date={dateStart}&end_date={dateEnd}&status={statusFilter}&search={search}` - Fetch paginated attendance records
- `PUT /admin/attendances/{id}` - Update attendance status
- `DELETE /admin/attendances/{id}` - Delete attendance record

---

## 2. ANALYTICS/INTEGRITY PAGES

### Admin Leaderboard & Analytics Page

**File:** [src/app/admin/leaderboard/page.tsx](src/app/admin/leaderboard/page.tsx)

**Page Name:** "📊 Analitik Integritas" (Integrity Analytics)

**Features:**

- Monthly/Yearly filter implementation (dropdown selectors)
- Summary cards showing:
  - Total users
  - Total points distributed
  - Average points per user
  - Top performer name and points
- Leaderboard display showing top and bottom performers
- Export data to CSV functionality
- Refresh data button
- Error handling and loading states

**Filter Implementation:**

```typescript
- Month selector (1-12): January to December
- Year selector: Current year -1, current year, current year +1
- Period display: Shows selected month/year period
- Change handler: changeMonth(newMonth, newYear)
```

**API Endpoints Used:**

- `GET /admin/analytics/leaderboard?month={month}&year={year}&limit=10` - Get top/bottom performers
- `GET /admin/analytics/summary?month={month}&year={year}` - Get monthly analytics summary
- Export endpoint (handled in service)

### Supporting Components

**File:** [src/components/IntegrityLeaderboard.tsx](src/components/IntegrityLeaderboard.tsx)

**Purpose:** Display leaderboard tables for top and bottom users

**Data Structure:**

```typescript
interface LeaderboardEntry {
  rank: number;
  user_id: number;
  name: string;
  nip?: string;
  total_points: number;
  change_from_previous?: number;
}
```

**Display Features:**

- Medal icons (🥇 🥈 🥉 #rank)
- User ranking with points
- Previous period change indicator
- Separate tables for top and bottom users
- Skeleton loader for loading states

---

## 3. LOCATION/ROOM FORMS (FORM TAMBAH LOKASI RUANG)

### Room Management Page

**File:** [src/app/admin/rooms/page.tsx](src/app/admin/rooms/page.tsx)

**Page Title:** "Lokasi Ruang" (Room Locations)
**Page Description:** "Kelola ruang kelas dan koordinat presensi" (Manage classroom locations and attendance coordinates)

**Features:**

- Create new room form
- Edit existing room form
- Delete rooms
- Display all rooms in card grid view
- View QR codes for each room
- View all QRs overview

**Room Form Modal:**

- **Mode:** Create or Edit
- **Fields:**
  - `room_name` (string) - Nama Ruang / Kelas (Room/Class Name)
  - `latitude` (number) - Latitude coordinate
  - `longitude` (number) - Longitude coordinate

**MapPicker Integration:**
Location form uses MapPicker component for visual coordinate selection

**Room Data Display:**

- Room name with ID
- Latitude and longitude coordinates
- Display QR button for each room
- Edit and Delete actions

**API Endpoints:**

- `GET /admin/rooms` - Fetch all rooms
- `POST /admin/rooms` - Create new room
- `PUT /admin/rooms/{id}` - Update room
- `DELETE /admin/rooms/{id}` - Delete room
- `GET /admin/rooms/{id}/dynamic-qr` - Get dynamic QR code with expiration

**Form Implementation Details:**

```typescript
const formData = {
  id: null | number;
  room_name: string;
  latitude: string;  // "6.200000"
  longitude: string; // "106.816666"
}
```

---

## 4. MAP PICKER COMPONENT

**File:** [src/components/MapPicker.tsx](src/components/MapPicker.tsx)

### Component Purpose

Interactive map-based location picker for selecting coordinates in room/location forms

### Props Interface

```typescript
interface MapPickerProps {
  onLocationSelect: (lat: number, long: number) => void;
  initialLat?: number; // Default: -6.2088
  initialLong?: number; // Default: 106.8456
  disabled?: boolean; // Default: false
}
```

### Features

**Map Display:**

- SVG-based visualization (not real map service)
- Grid pattern background
- Gradient background (blue-100 to green-100)
- Center red marker with concentric circles
- Crosshair lines for orientation
- Zoom-based rendering (not visible zoom change in SVG, but managed internally)

**Interactive Controls:**

- **Coordinate Input Fields:** Manual latitude/longitude input
  - Latitude validation: -90 to +90
  - Longitude validation: -180 to +180
- **Get Current Location Button:** Uses browser geolocation API
  - `navigator.geolocation.getCurrentPosition()`
  - Shows loading state during retrieval
  - Fetches current GPS coordinates (6 decimal places)
- **Zoom Controls:** In/Out buttons
  - Zoom range: 5 to 20
  - Visual feedback on center marker

**Coordinate Display:**

- Real-time coordinate display in top-left corner
- Shows Latitude and Longitude with 6 decimal precision
- Background white box with semi-transparency

**Callback Behavior:**

- Fires `onLocationSelect(lat, long)` on:
  - Manual coordinate input
  - Current location detection
  - When component receives prop changes

### MapPicker Usage in Rooms Form

```typescript
<MapPicker
  initialLat={parseFloat(formData.latitude) || -6.2}
  initialLong={parseFloat(formData.longitude) || 106.8}
  onLocationSelect={(lat, long) => {
    setFormData({
      ...formData,
      latitude: lat.toString(),
      longitude: long.toString(),
    });
  }}
/>
```

---

## 5. ANALYTICS SERVICE FILES

### Admin Analytics Service

**File:** [src/services/adminAnalyticsService.ts](src/services/adminAnalyticsService.ts)

**Exported Functions:**

#### `getIntegrityLeaderboard(params?)`

```typescript
Parameters: { month?, year?, limit? }
Returns: LeaderboardResponse
API: GET /admin/analytics/leaderboard
```

Fetches top and bottom performing users based on points

#### `getAnalyticsSummary(month?, year?)`

```typescript
Returns: AnalyticsSummary;
API: GET / admin / analytics / summary;
```

Fetches monthly summary statistics including:

- total_users
- total_points_distributed
- average_points_per_user
- top_performer info
- most_improved info

#### `getPointTrend(month?, year?)`

```typescript
Returns: PointTrendData[]
API: GET /admin/analytics/trend
```

Fetches point trend data for chart visualization

#### `exportLeaderboard(month, year)`

Exports leaderboard data as CSV

### Admin Point Service

**File:** [src/services/adminPointService.ts](src/services/adminPointService.ts)

**Purpose:** Admin management for point rules and marketplace items

**Main Endpoints:**

- `getRules()` - Get point rules with filters
- `getRuleById(id)` - Get specific rule
- `createRule(payload)` - Create new point rule
- `updateRule(id, payload)` - Update existing rule
- `toggleRule(id)` - Toggle rule active/inactive
- `deleteRule(id)` - Delete rule
- `getMarketplaceItems()` - Get marketplace items
- `getItemById(id)` - Get specific item
- `createItem(payload)` - Create marketplace item
- `updateItem(id, payload)` - Update item
- `deleteItem(id)` - Delete item

---

## 6. CUSTOM HOOKS

### useLeaderboard Hook

**File:** [src/hooks/useLeaderboard.ts](src/hooks/useLeaderboard.ts)

**Purpose:** Manage leaderboard state and data fetching with month/year filtering

**State Returned:**

```typescript
{
  // Data
  topUsers: LeaderboardEntry[];
  bottomUsers: LeaderboardEntry[];
  summary: AnalyticsSummary | null;
  period: string;

  // State
  month: number;
  year: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchLeaderboard(m?, y?);
  changeMonth(newMonth, newYear);
  refetch();
}
```

**Features:**

- Automatic fetch on mount
- Parallel data fetching (leaderboard + summary)
- Month/year change handling
- Error state management
- Loading state management

---

## 7. ADMIN LAYOUT & NAVIGATION

### Admin Dashboard Page

**File:** [src/app/admin/page.tsx](src/app/admin/page.tsx)

**Components Used:**

- AdminLayout wrapper
- Stat cards showing:
  - Total teachers (Total Guru)
  - Today's attendance summary
  - Presence status breakdown (Present, Late, Absent)

---

## 8. DIRECTORY STRUCTURE SUMMARY

```
src/
├── app/
│   ├── admin/
│   │   ├── page.tsx                          # Dashboard
│   │   ├── attendances/
│   │   │   └── page.tsx                      # Attendance management ✓
│   │   ├── leaderboard/
│   │   │   └── page.tsx                      # Analytics/Integrity ✓
│   │   ├── rooms/
│   │   │   ├── page.tsx                      # Room locations ✓
│   │   │   └── all-qrs/
│   │   │       └── page.tsx
│   │   ├── assessment-categories/
│   │   ├── flexibility-marketplace/
│   │   ├── point-rules/
│   │   ├── schedules/
│   │   ├── school-profile/
│   │   └── users/
│   └── ...other routes
├── components/
│   ├── MapPicker.tsx                         # Map picker component ✓
│   ├── IntegrityLeaderboard.tsx              # Leaderboard display ✓
│   ├── AdminLayout.tsx
│   └── ...other components
├── hooks/
│   ├── useLeaderboard.ts                     # Leaderboard hook ✓
│   └── ...other hooks
├── services/
│   ├── adminAnalyticsService.ts              # Analytics API calls ✓
│   ├── adminPointService.ts                  # Point management ✓
│   └── ...other services
└── types/
    └── point.ts
```

---

## 9. KEY TECHNOLOGY STACK

**Frontend Framework:** Next.js (App Router with "use client")
**Styling:** Tailwind CSS
**UI Components:** Lucide React icons
**HTTP Client:** Axios (custom configured in lib/axios)
**QR Generation:** qrcode.react library
**Geolocation:** Browser native geolocation API

---

## 10. FILE SUMMARY TABLE

| Feature               | File Path                               | Type      |
| --------------------- | --------------------------------------- | --------- |
| Attendance Management | src/app/admin/attendances/page.tsx      | Page      |
| Integrity Analytics   | src/app/admin/leaderboard/page.tsx      | Page      |
| Room Locations        | src/app/admin/rooms/page.tsx            | Page      |
| Map Picker Component  | src/components/MapPicker.tsx            | Component |
| Leaderboard Component | src/components/IntegrityLeaderboard.tsx | Component |
| Analytics Service     | src/services/adminAnalyticsService.ts   | Service   |
| Point Service         | src/services/adminPointService.ts       | Service   |
| Leaderboard Hook      | src/hooks/useLeaderboard.ts             | Hook      |
| Admin Dashboard       | src/app/admin/page.tsx                  | Page      |
| Admin Layout          | src/components/AdminLayout.tsx          | Component |

---

## 11. DATA FLOW SUMMARY

### Attendance Management Flow

1. **User navigates to:** `/admin/attendances`
2. **Component:** AdminAttendances page
3. **Data fetching:** Axios GET to `/admin/attendances` with filters
4. **Display:** Table showing teacher attendance records
5. **Actions:** View evidence, Edit status, Delete record

### Analytics/Integrity Flow

1. **User navigates to:** `/admin/leaderboard`
2. **Hook:** useLeaderboard handles data fetching
3. **API Calls:**
   - Parallel fetch of leaderboard and summary data
   - Uses month/year parameters from selectors
4. **Display:**
   - Summary cards
   - IntegrityLeaderboard component shows top/bottom users
5. **Export:** CSV export via adminAnalyticsService

### Room Location Flow

1. **User navigates to:** `/admin/rooms`
2. **Component:** AdminRooms page
3. **Create/Edit Modal:** Opens with MapPicker component
4. **MapPicker:**
   - Visual location selection
   - Coordinate input fields
   - Get current location option
5. **Form submission:** POST/PUT to `/admin/rooms` endpoint
6. **Display:** Cards showing all rooms with coordinates

---

## 12. MONTH/YEAR FILTERING IMPLEMENTATION (Analytics)

Located in: [src/app/admin/leaderboard/page.tsx](src/app/admin/leaderboard/page.tsx#L31-L50)

**Implementation Details:**

```typescript
const months = ["Januari", "Februari", ..., "Desember"];
const years = [currentYear - 1, currentYear, currentYear + 1];

// Month selector
<select value={month} onChange={(e) => changeMonth(parseInt(e.target.value), year)}>

// Year selector
<select value={year} onChange={(e) => changeMonth(month, parseInt(e.target.value))}>

// Hook handles the API call with parameters
useLeaderboard.changeMonth(newMonth, newYear);
```

**API Integration:**

- Sends month (1-12) and year (YYYY) to backend
- Fetches filtered analytics data
- Updates summary and leaderboard displays
