# Dokumentasi Implementasi Helpdesk System

## 🎯 Ringkasan

Sistem Helpdesk telah berhasil diimplementasikan dengan fitur-fitur cerdas untuk efisiensi penanganan tiket. Sistem ini mengintegrasikan:

- Anti-duplikasi dengan full-text search
- SLA tracking untuk monitoring performa
- Auto-reply suggestions berdasarkan kategori
- Dashboard analytics komprehensif untuk kepala sekolah

## 📋 Fitur Utama

### 1. Anti-Duplikasi & Full-Text Search 🔍

**Implementasi:**

- MySQL FULLTEXT INDEX pada kolom `subject` dan `description` di tabel `tickets`
- Similarity scoring menggunakan Levenshtein distance (0-100%)
- Otomatis warning jika ditemukan tiket dengan similarity > 70%

**Service:** `TicketDuplicateCheckerService`

**Method:**

```php
// Cek tiket serupa
$similar = $duplicateChecker->getSimilarTicketsWithScore($subject, $description);

// Cek jika ada duplikasi kemungkinan
$isDuplicate = $duplicateChecker->hasPossibleDuplicate($subject, $description);
```

**Flow:**

1. Guru membuat tiket baru
2. Sistem otomatis check tiket serupa menggunakan FULLTEXT search
3. Jika similarity > 70%, tampilkan warning + daftar tiket serupa
4. Guru bisa memilih untuk melihat tiket serupa atau tetap create tiket baru

### 2. SLA Tracking & Response Management ⏱️

**Response Time SLA:**

- High Priority: 30 menit
- Mid Priority: 60 menit
- Low Priority: 120 menit

**Resolution Time SLA:**

- High Priority: 4 jam
- Mid Priority: 8 jam
- Low Priority: 24 jam

**Service:** `SLATrackingService`

**Key Fields:**

- `first_response_at`: Tercatat otomatis saat admin balas pertama kali
- `resolved_at`: Tercatat otomatis saat tiket status = Closed

**Method:**

```php
// Hitung response time
$responseTime = $slaService->getResponseTime($ticket);
// Output: ['minutes' => 45, 'hours' => 0, 'formatted' => '45 menit', 'is_within_sla' => true]

// Hitung resolution time
$resolutionTime = $slaService->getResolutionTime($ticket);

// SLA compliance rate untuk admin
$compliance = $slaService->getSLAComplianceForAdmin($adminId, $startDate, $endDate);
// Output: 85.5 (percentage)
```

### 3. Auto-Reply Suggestions 🤖

**Kategori Masalah:**

1. **Attendance** - Kehadiran/Absensi
2. **Permission** - Izin/Cuti
3. **Points** - Poin Integritas
4. **Marketplace** - Marketplace
5. **Assessment** - Penilaian/Evaluasi
6. **Technical** - Masalah Teknis
7. **Other** - Lainnya

**Service:** `AutoReplySuggestionService`

**Smart Detection:** Sistem otomatis mendeteksi kategori berdasarkan keywords:

```php
// Contoh keywords:
// 'attendance' -> absen, kehadiran, hadir, tidak hadir, masuk, pulang
// 'permission' -> izin, cuti, sakit, keperluan, libur
// 'points' -> poin, integritas, reward, nilai, skor
```

**Method:**

```php
// Get saran berdasarkan kategori
$suggestions = $autoReply->getSuggestions('attendance', 3);

// Smart detection + saran
$smart = $autoReply->getSmartSuggestions($subject, $description);
// Output:
// {
//   "detected_category": "attendance",
//   "category_display": "Kehadiran/Absensi",
//   "suggestions": [...]
// }
```

**Admin UI:**

- Saat merespons tiket, admin melihat saran jawaban berdasarkan kategori
- Bisa langsung klik untuk mempakai template saran
- Atau edit template sebelum mengirim

### 4. Dashboard Analytics Kepala Sekolah 📊

**Service:** `HelpDeskAnalyticsService`

**Metrik Utama:**

- Total tickets, closure rate, average response time, average satisfaction
- Per-admin performance dengan breakdown:
  - Assigned tickets
  - Resolved tickets
  - Resolution rate
  - Average response time
  - Average resolution time
  - SLA compliance percentage
  - Average satisfaction score

**Satisfaction Analytics:**

- Total ratings received
- Average score (1-5)
- Distribution per star rating
- Percentage satisfied (4-5 stars)

**Method:**

```php
// Dashboard lengkap
$dashboard = $analytics->getDashboardAnalytics($startDate, $endDate);
// Output:
// {
//   "summary": {...},
//   "admin_performance": [...],
//   "satisfaction_stats": {...},
//   "tickets_by_priority": {...},
//   "tickets_by_status": {...},
//   "response_time_trend": [...]
// }

// Export data
$export = $analytics->getExportData($startDate, $endDate);
```

## 🏗️ Arsitektur

### Database Schema

```sql
-- Tickets Table
CREATE TABLE tickets (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  reporter_id BIGINT FOREIGN KEY -> users.id,
  operator_id BIGINT FOREIGN KEY -> users.id (nullable),
  subject VARCHAR(255),
  description TEXT,
  priority ENUM('Low', 'Mid', 'High'),
  status ENUM('Open', 'In-progress', 'Closed'),
  first_response_at TIMESTAMP (nullable),
  resolved_at TIMESTAMP (nullable),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FULLTEXT INDEX (subject, description)
);

-- Ticket Responses Table
CREATE TABLE ticket_response (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  ticket_id BIGINT FOREIGN KEY -> tickets.id,
  responder_id BIGINT FOREIGN KEY -> users.id,
  message TEXT,
  is_auto_reply BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Satisfaction Ratings Table
CREATE TABLE satisfaction_ratings (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  ticket_id BIGINT UNIQUE FOREIGN KEY -> tickets.id,
  score TINYINT UNSIGNED (1-5),
  feedback TEXT (nullable),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### API Routes

#### Guru Routes (Protected)

```
GET    /helpdesk/tickets
POST   /helpdesk/tickets
GET    /helpdesk/tickets/check-duplicates
GET    /helpdesk/tickets/{id}
PUT    /helpdesk/tickets/{id}
POST   /helpdesk/tickets/{id}/responses
```

#### Admin Routes (Protected + Admin Middleware)

```
GET    /admin/helpdesk/tickets
GET    /admin/helpdesk/tickets/{id}
PUT    /admin/helpdesk/tickets/{id}
DELETE /admin/helpdesk/tickets/{id}
POST   /admin/helpdesk/tickets/{id}/responses
GET    /admin/helpdesk/tickets/{id}/suggestions
POST   /admin/helpdesk/tickets/bulk-update
```

#### Kepala Sekolah Routes (Protected + Kepsek Middleware)

```
GET /kepsek/helpdesk/analytics
GET /kepsek/helpdesk/performance
GET /kepsek/helpdesk/satisfaction
GET /kepsek/helpdesk/summary
GET /kepsek/helpdesk/export
```

## 🎨 Frontend Pages

### Guru Pages

**1. `/absen-manual/tickets` - List Tiket**

- Filter: status, priority, search
- Pagination
- Stats: total, sedang diproses, selesai
- Tombol: Buat Tiket Baru

**2. `/absen-manual/create-ticket` - Buat Tiket**

- Form: subject, description, priority
- Duplicate check button
- Tampilan tiket serupa dengan similarity score
- Warning jika ada duplikasi kemungkinan

**3. `/absen-manual/tickets/{id}` - Detail Tiket**

- Informasi tiket lengkap
- Percakapan (responses) dengan auto-refresh
- Form untuk merespons
- Tombol close ticket (hanya untuk reporter)
- SLA info (jika tersedia)

### Admin Pages

**1. `/admin/helpdesk` - List Semua Tiket**

- Filter: status, priority, unassigned, search
- Pagination
- Stats: total, open, in-progress, closed
- Tabel dengan kolom: ID, subject, pelapor, admin, status, priority, dibuat, aksi
- Tombol: Lihat Detail

**2. `/admin/helpdesk/{id}` - Detail Tiket**

- Tiket detail + responses
- Auto-refresh percakapan
- Response form dengan auto-reply suggestions
- Sidebar: update form (status, priority)
- SLA tracking info

### Kepala Sekolah Pages

**1. `/kepala-sekolah/helpdesk-analytics` - Dashboard Analytics**

- Period filter: Hari ini, Minggu ini, Bulan ini, Bulan lalu
- Summary cards: total, closure rate, avg response, satisfaction
- Grafik: satisfaction rating distribution
- Tabel: admin performance metrics
- Top performer & slowest admin identification

## 🔐 Role-Based Access Control

| Feature                | Guru | Admin | Kepala Sekolah |
| ---------------------- | ---- | ----- | -------------- |
| Create Ticket          | ✅   | ❌    | ❌             |
| View Own Tickets       | ✅   | ❌    | ❌             |
| View All Tickets       | ❌   | ✅    | ❌             |
| Assign Ticket          | ❌   | ✅    | ❌             |
| Update Status/Priority | ❌   | ✅    | ❌             |
| Respond to Ticket      | ✅   | ✅    | ❌             |
| Close Ticket           | ✅   | ✅    | ❌             |
| View Analytics         | ❌   | ❌    | ✅             |
| Rate Ticket            | ✅   | ❌    | ❌             |

## 📝 Workflow Example

### Typical User Journey

**Guru:**

1. Buka `/absen-manual/tickets`
2. Klik "Buat Tiket Baru"
3. Isi form dengan subject, description, priority
4. Klik "Cek Tiket Serupa" → lihat hasil
5. Jika tidak ada duplikasi, klik "Buat Tiket"
6. Tiket berhasil dibuat
7. Klik tiket untuk lihat detail & percakapan
8. Jika sudah terselesaikan, klik "Tutup Tiket"
9. Setelah tiket ditutup, bisa rate dengan 1-5 bintang

**Admin:**

1. Buka `/admin/helpdesk`
2. Lihat daftar tiket dengan filter
3. Klik tiket yang open untuk assign ke diri sendiri
4. View auto-reply suggestions
5. Balas tiket (pakai template atau tulis sendiri)
6. Update status menjadi In-progress
7. Lanjutkan percakapan sampai resolved
8. Update status menjadi Closed
9. Sistem otomatis record resolved_at

**Kepala Sekolah:**

1. Buka `/kepala-sekolah/helpdesk-analytics`
2. Pilih period (default: bulan ini)
3. Lihat dashboard:
   - Total tiket & closure rate
   - Rata-rata response time
   - Tingkat kepuasan pengguna
   - Performa per admin
   - Top performer & admin yang perlu perhatian
4. Export data jika diperlukan

## 🚀 Deployment Checklist

### Backend

- [ ] Run migration: `php artisan migrate`
- [ ] Test API endpoints dengan Postman/Insomnia
- [ ] Verify FULLTEXT index dibuat di tabel `tickets`
- [ ] Set proper env variables

### Frontend

- [ ] Install dependencies: `npm install`
- [ ] Build: `npm run build`
- [ ] Test routes di development
- [ ] Verify API connectivity
- [ ] Test role-based access

### Database

- [ ] Backup existing database
- [ ] Run migrations
- [ ] Verify tables created correctly
- [ ] Test FULLTEXT search performance

## 🐛 Testing

### Duplicate Detection Testing

```
1. Create ticket: "Masalah Login" / "Tidak bisa login ke aplikasi"
2. Create similar: "Problem Login" / "Aplikasi login tidak bisa"
   → Should show warning (similarity > 70%)
```

### SLA Testing

```
1. Create High priority ticket
2. Wait 30 min, admin responds
   → first_response_at recorded, response_time = ~30 min
3. Close ticket after 4 hours
   → resolved_at recorded, resolution_time = ~4 hours
```

### Auto-Reply Testing

```
1. Create ticket about "kehadiran tidak tercatat"
2. Admin lihat detail ticket
   → Should show "Kehadiran/Absensi" suggestions
```

## 📚 API Examples

### Create Ticket with Duplicate Check

```bash
POST /helpdesk/tickets
{
  "subject": "Masalah Login Aplikasi",
  "description": "Saya tidak bisa login ke aplikasi sejak kemarin pagi. Selalu muncul error authentication failed.",
  "priority": "High",
  "check_duplicates": true
}

Response 409 (jika ada duplikasi):
{
  "success": false,
  "message": "Ditemukan tiket serupa. Mohon periksa apakah masalah Anda sudah pernah dilaporkan.",
  "similar_tickets": [
    {
      "ticket_id": 5,
      "subject": "Tidak bisa login",
      "average_similarity": 85,
      ...
    }
  ],
  "status": "duplicate_warning"
}

Response 201 (jika berhasil):
{
  "success": true,
  "data": { ... },
  "suggestions_for_operator": {
    "detected_category": "technical",
    "suggestions": [ ... ]
  }
}
```

### Get Analytics Dashboard

```bash
GET /kepsek/helpdesk/analytics?period=this_month

Response:
{
  "success": true,
  "period": { "start_date": "2026-04-01", "end_date": "2026-04-30" },
  "data": {
    "summary": {
      "total_tickets": 45,
      "closed_tickets": 38,
      "closure_rate": 84.44,
      "average_response_time_minutes": 45.2,
      "average_satisfaction_score": 4.3
    },
    "admin_performance": [
      {
        "admin_id": 2,
        "admin_name": "Admin Budi",
        "assigned_tickets": 15,
        "resolved_tickets": 14,
        "sla_compliance_percentage": 93.3,
        "average_satisfaction_score": 4.5
      }
    ]
  }
}
```

## ⚙️ Configuration

Tidak ada konfigurasi khusus yang diperlukan. Semua default values sudah di-set di service:

- SLA thresholds: High(30m), Mid(60m), Low(120m)
- Duplicate similarity threshold: 70%
- Auto-reply categories: 7 kategori

Untuk mengubah SLA thresholds, edit method `getResponseTimeSLA()` dan `getResolutionTimeSLA()` di `SLATrackingService.php`

## 📞 Support & Troubleshooting

### Issue: FULLTEXT search tidak berfungsi

**Solution:** Pastikan migration sudah run dan FULLTEXT index ada:

```sql
SHOW INDEX FROM tickets WHERE Key_name LIKE '%FULLTEXT%';
```

### Issue: Admin tidak bisa melihat auto-reply suggestions

**Solution:** Periksa database apakah tiket punya data. Auto-reply suggestions base dari kategori.

### Issue: SLA time tidak tercatat

**Solution:** Pastikan:

1. Admin merespons tiket (trigger first_response_at)
2. Tiket di-close (trigger resolved_at)
3. Timestamps di database tidak null

## 🎓 Future Enhancements

- [ ] Email notifications saat ada respons baru
- [ ] Attachment/file upload untuk tiket
- [ ] Tiket priority auto-change based on age
- [ ] Escalation rules (auto-escalate jika SLA violation)
- [ ] Feedback form untuk rating tiket
- [ ] Canned responses (template library)
- [ ] Tiket history/audit trail
- [ ] Chatbot pre-response untuk FAQ common issues
- [ ] Telegram/WhatsApp integration untuk notifications
- [ ] Advanced analytics dengan trend analysis

---

**Documentation Version:** 1.0
**Last Updated:** April 23, 2026
**Status:** ✅ Production Ready
