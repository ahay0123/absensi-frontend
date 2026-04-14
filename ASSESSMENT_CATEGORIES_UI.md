# Frontend UI Documentation - Assessment Category Master Data

**Page Location:** `/src/app/admin/assessment-categories/page.tsx`
**Route:** `/admin/assessment-categories`
**Access Level:** Admin Only
**Design Pattern:** "Minimum Clicks, Maximum Insight"

---

## 🎨 Visual Layout

### Header Section

- **Title:** "Indikator Penilaian"
- **Subtitle:** "Kelola indikator penilaian kedisiplinan guru dengan mudah"
- **Action Button:** "Tambah Indikator Baru" (gradient blue-indigo)
- **Responsive:** Stack on mobile, flex on desktop

### Main Features

#### 1. **Search Bar**

- **Icon:** Search icon on left
- **Placeholder:** "Cari indikator penilaian..."
- **Behavior:** Real-time filter
- **Styling:** Rounded border with focus ring (blue)

#### 2. **Data Table (DataTables-like)**

- **Columns:**
  1. **Nama Indikator** - Left aligned, bold font
     - Sortable (click to toggle asc/desc)
     - Shows chevron icon when sorted
  2. **Tipe** - Left aligned, regular font
  3. **Deskripsi** - Left aligned, truncated for long text
  4. **Dibuat** - Left aligned, formatted date
     - Sortable (click to toggle asc/desc)
     - Shows chevron icon when sorted
  5. **Status** - Badge display
     - Green badge: "Aktif" with green dot indicator
     - Slate badge: "Nonaktif" with gray dot indicator
  6. **Aksi** - Action buttons (center aligned)

#### 3. **Action Buttons** (minimum 3)

Located in the rightmost "Aksi" column for each row:

| Button               | Icon       | Color        | Action              | Notes               |
| -------------------- | ---------- | ------------ | ------------------- | ------------------- |
| Edit                 | Edit2      | Blue         | Opens edit modal    | Can edit all fields |
| Nonaktifkan/Aktifkan | Eye/EyeOff | Yellow/Green | Toggle status       | Soft delete pattern |
| Hapus                | Trash2     | Red          | Delete confirmation | Hard delete         |

**Button Styling:**

- Circular background on hover
- Icon only (no text) for compact design
- Color matched to action type
- Smooth transitions

#### 4. **Status Badges**

```
Aktif:    ● Aktif      (green-100 bg, green-700 text)
Nonaktif: ● Nonaktif   (slate-100 bg, slate-600 text)
```

#### 5. **Pagination Controls**

- **Location:** Bottom of table
- **Info:** "Halaman X dari Y (Total: Z)"
- **Buttons:**
  - "Sebelumnya" (disabled on page 1)
  - "Berikutnya" (disabled on last page)
- **Styling:** Light slate border, hover effect

---

## 🎯 Interactive Features

### 1. Create Modal

**Title:** "Tambah Indikator Penilaian Baru"

**Form Fields:**

```
┌─────────────────────────────────────┐
│ Nama Indikator * (Required)          │
│ [_______________________________]    │
│                                       │
│ Tipe * (Required)                    │
│ [_______________________________]    │
│                                       │
│ Deskripsi (Optional)                 │
│ [_______________________________]    │
│ [_______________________________]    │
│ [_______________________________]    │
│                                       │
└─────────────────────────────────────┘
```

**Modal Actions:**

- **Batal:** Gray border button (left)
- **Simpan:** Gradient blue-indigo button (right)
  - Shows "Menyimpan..." with spinner on submit
  - Disabled during save

**Validation:**

- Both name and type must not be empty
- Shows error message in red box if validation fails
- Success message on successful save

### 2. Edit Modal

**Title:** "Edit Indikator Penilaian"
**Identical layout to Create Modal**

- Pre-fills existing data
- Same validation rules
- Updates via PUT endpoint

### 3. Delete Confirmation Dialog

**Title:** "Hapus Indikator?"
**Icon:** Red alert circle

**Message:** "Indikator penilaian akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan."

**Actions:**

- **Batal:** Closes dialog
- **Hapus:** Red button, performs DELETE

### 4. Deactivate Confirmation Dialog

**Title:** "Nonaktifkan Indikator?"
**Icon:** Yellow alert circle

**Message:** "Indikator penilaian akan dinonaktifkan dan tidak akan muncul dalam proses penilaian."

**Actions:**

- **Batal:** Closes dialog
- **Nonaktifkan:** Yellow button, performs PATCH toggle-status

---

## 📱 Responsive Design

### Desktop (1024px+)

- Full sidebar visible
- Table fully visible horizontally
- 2-column header layout (title left, button right)

### Tablet (768px - 1023px)

- Sidebar toggle visible
- Table may have horizontal scroll
- Stacked header (title top, button bottom)

### Mobile (<768px)

- Sidebar hidden by default (hamburger menu)
- Table responsive with horizontal scroll
- Buttons stack vertically
- Modal takes full width with max-width constraint
- Stacked header

---

## 🎨 Color & Styling System

### Color Palette

- **Primary:** Blue (600: #2563eb)
- **Secondary:** Indigo (600: #4f46e5)
- **Success:** Green (100 bg, 700 text)
- **Warning/Inactive:** Yellow/Slate (100 bg, 600/700 text)
- **Danger:** Red (600: #dc2626)

### Background Gradients

- **Page:** `from-slate-50 via-blue-50 to-indigo-50`
- **Header:** `from-slate-50 to-blue-50`
- **Button:** `from-blue-600 to-indigo-600`

### Shadows

- **Card:** `shadow-sm` (subtle)
- **Modal:** `shadow-2xl` (pronounced)
- **Button:** `hover:shadow-lg` (on hover)

### Borders & Radius

- **Table:** `rounded-xl` (11px)
- **Modal:** `rounded-xl` (11px)
- **Buttons:** `rounded-lg` (8px)
- **Badges:** `rounded-full` (pill shape)

---

## ✨ Animations & Transitions

### Notification Messages

```css
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-2rem);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
/* Duration: 0.3s ease-out */
```

### Button Interactions

- **Add Button:** `hover:scale-105` + `shadow-lg`
- **Icon Buttons:** Smooth color transition on hover
- **Row Hover:** `hover:bg-blue-50/50` (subtle background)

### Loading States

- **Spinner:** Rotating `Loader2` icon (blue-600)
- **Text:** "Memuat data..." or "Menyimpan..."

### Modal Display

- **Backdrop:** `bg-black/50 backdrop-blur-sm`
- **Entrance:** Smooth position transition

---

## 🔄 State Management

### Loading States

1. **Initial Load:** Spinner + "Memuat data..."
2. **Saving:** Button disabled + spinner + "Menyimpan..."
3. **Error:** Red alert box with message
4. **Success:** Green slideIn notification (auto-dismiss 3s)

### Empty State

```
Title: "Belum ada indikator penilaian"
Subtitle: "Klik tombol 'Tambah Indikator Baru' untuk memulai"
```

### Error Messages

**Types:**

- Validation errors (red box with Alert icon)
- API errors (red box with error message)
- Network errors (fallback message)

**Placement:**

- In modal: below header
- On page: below search bar
- Auto-dismiss: 3 seconds

---

## 🎮 User Interactions

### 1. Create New Indicator

```
Click "Tambah Indikator Baru"
  → Modal opens
  → Fill form fields
  → Click "Simpan"
  → Success message
  → Modal closes
  → Table refreshes
```

### 2. Edit Indicator

```
Click Edit icon
  → Modal opens with pre-filled data
  → Modify fields as needed
  → Click "Simpan"
  → Success message
  → Modal closes
  → Table refreshes
```

### 3. Deactivate Indicator

```
Click Eye-Off icon
  → Confirmation dialog appears
  → Click "Nonaktifkan"
  → Status changes to "Nonaktif"
  → Badge updates to gray
  → Success message
```

### 4. Delete Indicator

```
Click Trash icon
  → Delete confirmation dialog appears
  → Click "Hapus"
  → Row removed from table
  → Success message
```

### 5. Search

```
Type in search bar
  → Real-time filter
  → Table updates
  → Shows matching results
```

### 6. Sort

```
Click "Nama Indikator" or "Dibuat" header
  → Toggle sort order (asc ↔ desc)
  → Chevron icon indicates current sort
  → Table reorganizes
```

### 7. Pagination

```
Click "Berikutnya" / "Sebelumnya"
  → Fetch data for requested page
  → Table updates
  → Row numbers change
```

---

## 📊 Data Displayed per Row

```javascript
{
  id: number,              // Hidden but used in API calls
  name: "Kehadiran...",   // Visible: bold font
  type: "Kedisiplinan",   // Visible: regular font
  description: "Kemampuan datang...",  // Visible: truncate
  is_active: true,        // Visible: badge (Aktif/Nonaktif)
  created_at: "11 Mar 2026"  // Visible: formatted date
}
```

---

## 🚀 Performance Considerations

1. **Pagination:** Load 10 items per page to avoid table bloat
2. **Search:** Debounced on frontend, server-side limited
3. **Sorting:** Client-side only (small dataset expected)
4. **Icons:** Use Lucide React (lightweight, tree-shakeable)
5. **Images:** Avatar uses UI Avatar service if available

---

## 🔐 Security Features

1. **Role Check:** AdminLayout component checks `isAdmin()`
2. **Token:** Axios instance includes `Authorization` header
3. **XSS Prevention:** React auto-escapes content
4. **CSRF:** Handled by backend middleware

---

## 📝 Example Workflows

### Workflow 1: Quick Add

1. Click "Tambah Indikator Baru"
2. Type "Kepemimpinan" in name field
3. Type "Leadership" in type field
4. Leave description empty
5. Click "Simpan"
6. See success message
7. New item appears in table

### Workflow 2: Bulk Management

1. Search for "Kedisiplinan"
2. 3 results show
3. Edit first one (change description)
4. Deactivate second one (becomes gray)
5. Delete third one (removed)
6. Search clears
7. Full list reappears

---

## 🐛 Error Handling Examples

### Validation Error (Empty Name)

```
┌─────────────────────────────────────┐
│ ⚠️ Nama dan Tipe harus diisi         │
│ [Close button]                       │
└─────────────────────────────────────┘
```

### Duplicate Name Error

```
┌─────────────────────────────────────┐
│ ⚠️ Nama 'Kehadiran Tepat Waktu'      │
│    sudah digunakan                  │
└─────────────────────────────────────┘
```

### API Error

```
┌─────────────────────────────────────┐
│ ⚠️ Gagal memuat data indikator       │
│    penilaian                        │
└─────────────────────────────────────┘
```

---

## ✅ Testing Checklist

- [ ] Create new indicator with all fields filled
- [ ] Create indicator with only required fields
- [ ] Create fails with empty name
- [ ] Create fails with duplicate name
- [ ] Edit indicator details
- [ ] Search filters results correctly
- [ ] Sorting works (name asc/desc, date asc/desc)
- [ ] Pagination navigates correctly
- [ ] Deactivate changes status to Nonaktif
- [ ] Reactivate changes status to Aktif
- [ ] Delete removes item from table
- [ ] Success message appears and auto-dismisses
- [ ] Modal closes after successful save
- [ ] Responsive design on mobile/tablet/desktop
- [ ] Search clears when filter removed
- [ ] Can navigate while modal is open
