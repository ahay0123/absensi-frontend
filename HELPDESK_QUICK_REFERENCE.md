# Helpdesk Implementation - Quick Reference

## 📍 File Locations

### Backend (Laravel)

**Services:**

- `app/Services/TicketDuplicateCheckerService.php` - Duplicate detection
- `app/Services/SLATrackingService.php` - SLA tracking
- `app/Services/AutoReplySuggestionService.php` - Auto-reply suggestions
- `app/Services/HelpDeskAnalyticsService.php` - Analytics

**Controllers:**

- `app/Http/Controllers/Api/TicketController.php` - Guru endpoints
- `app/Http/Controllers/Api/Admin/AdminTicketController.php` - Admin endpoints
- `app/Http/Controllers/Api/Kepsek/KepsekHelpDeskAnalyticsController.php` - Kepala Sekolah endpoints

**Models:**

- `app/Models/Ticket.php` (already exists)
- `app/Models/TicketResponse.php` (already exists)
- `app/Models/SatisfactionRating.php` (already exists)

**Routes:**

- `routes/api.php` - All API endpoints

### Frontend (Next.js)

**Services:**

- `src/services/helpDeskService.ts` - API client

**Pages:**

- `src/app/absen-manual/tickets/page.tsx` - Guru: List tickets
- `src/app/absen-manual/create-ticket/page.tsx` - Guru: Create ticket
- `src/app/absen-manual/tickets/[id]/page.tsx` - Guru: Ticket detail
- `src/app/admin/helpdesk/page.tsx` - Admin: List tickets
- `src/app/admin/helpdesk/[id]/page.tsx` - Admin: Ticket detail
- `src/app/kepala-sekolah/helpdesk-analytics/page.tsx` - Kepala Sekolah: Analytics

## 🔌 API Endpoints Summary

| Method | Path                                     | Role       | Description                |
| ------ | ---------------------------------------- | ---------- | -------------------------- |
| GET    | /helpdesk/tickets                        | Guru       | List own tickets           |
| POST   | /helpdesk/tickets                        | Guru       | Create ticket              |
| GET    | /helpdesk/tickets/{id}                   | Guru       | View ticket detail         |
| PUT    | /helpdesk/tickets/{id}                   | Guru       | Update/close ticket        |
| POST   | /helpdesk/tickets/{id}/responses         | Guru/Admin | Respond to ticket          |
| GET    | /helpdesk/tickets/check-duplicates       | Guru       | Check for duplicates       |
| GET    | /admin/helpdesk/tickets                  | Admin      | List all tickets           |
| GET    | /admin/helpdesk/tickets/{id}             | Admin      | View ticket detail         |
| PUT    | /admin/helpdesk/tickets/{id}             | Admin      | Update ticket              |
| DELETE | /admin/helpdesk/tickets/{id}             | Admin      | Delete ticket              |
| GET    | /admin/helpdesk/tickets/{id}/suggestions | Admin      | Get auto-reply suggestions |
| POST   | /admin/helpdesk/tickets/bulk-update      | Admin      | Bulk update tickets        |
| GET    | /kepsek/helpdesk/analytics               | Kepsek     | Get dashboard analytics    |
| GET    | /kepsek/helpdesk/performance             | Kepsek     | Get admin performance      |
| GET    | /kepsek/helpdesk/satisfaction            | Kepsek     | Get satisfaction stats     |
| GET    | /kepsek/helpdesk/summary                 | Kepsek     | Get summary overview       |
| GET    | /kepsek/helpdesk/export                  | Kepsek     | Export analytics data      |

## 🎯 Features Quick Reference

### Feature 1: Duplicate Detection

```
Trigger: When creating new ticket
Technology: MySQL FULLTEXT search + Levenshtein distance
Threshold: 70% similarity
Action: Show warning + list similar tickets
Flow: Guru → Check duplicates → See results → Create or Cancel
```

**Config in `TicketDuplicateCheckerService`:**

- Change threshold: modify in `hasPossibleDuplicate()` (line ~73)
- Change search algorithm: modify `buildSearchQuery()` method

### Feature 2: SLA Tracking

```
SLA High:   Response 30min   | Resolution 4h
SLA Mid:    Response 60min   | Resolution 8h
SLA Low:    Response 120min  | Resolution 24h

Tracked in tickets table:
- first_response_at (auto-set when admin responds first time)
- resolved_at (auto-set when status = Closed)
```

**Config in `SLATrackingService`:**

- Change SLA times: modify `getResponseTimeSLA()` and `getResolutionTimeSLA()` methods
- Response types: `getResponseTime()` returns formatted duration

### Feature 3: Auto-Reply Suggestions

```
Categories:
1. Attendance - kehadiran, absen, masuk, pulang
2. Permission - izin, cuti, sakit, libur
3. Points - poin, integritas, reward, skor
4. Marketplace - barang, hadiah, tukar, voucher
5. Assessment - penilaian, evaluasi, kinerja
6. Technical - error, bug, login, aplikasi
7. Other - default category
```

**Config in `AutoReplySuggestionService`:**

- Add category: add to `$suggestionTemplates` array
- Change keywords: modify regex patterns in `detectCategoryFromContent()`
- Add templates: add to respective category array

### Feature 4: Analytics Dashboard

```
Metrics:
- Total tickets, closure rate, avg response time, satisfaction
- Per admin: assigned, resolved, compliance, satisfaction
- Satisfaction: distribution 1-5 stars, percentage satisfied (4-5)
- Trend: response time per day

Filters:
- Period: today, this_week, this_month, last_month, custom
- Date range: start_date + end_date
```

**Config in `HelpDeskAnalyticsService`:**

- Change metrics: modify `getDashboardAnalytics()` method
- Add new metric: add to relevant calculation method

## 🗄️ Database Schema

```
tickets
├── id (PK)
├── reporter_id (FK) → users
├── operator_id (FK) → users (nullable)
├── subject (VARCHAR 255)
├── description (TEXT)
├── priority (ENUM: Low|Mid|High)
├── status (ENUM: Open|In-progress|Closed)
├── first_response_at (TIMESTAMP nullable)
├── resolved_at (TIMESTAMP nullable)
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
└── FULLTEXT INDEX (subject, description)

ticket_response
├── id (PK)
├── ticket_id (FK) → tickets
├── responder_id (FK) → users
├── message (TEXT)
├── is_auto_reply (BOOLEAN)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

satisfaction_ratings
├── id (PK)
├── ticket_id (FK UNIQUE) → tickets
├── score (TINYINT: 1-5)
├── feedback (TEXT nullable)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

## 🔐 Middleware/Auth

**Required Middleware:**

- `auth:sanctum` - All protected routes
- `admin` - Admin-only routes (verify role = 'admin')
- `kepsek` - Kepala Sekolah-only routes (verify role = 'kepala_sekolah')

**Check Auth:**

```php
auth()->user() // Current authenticated user
auth()->id() // Current user ID
auth()->user()->role // Current user role
```

## 📊 Response Examples

### Create Ticket Response

```json
{
  "success": true,
  "message": "Tiket berhasil dibuat",
  "data": {
    "id": 1,
    "subject": "Tidak bisa login",
    "description": "...",
    "priority": "High",
    "status": "Open",
    "reporter_id": 2,
    "created_at": "2026-04-23T10:30:00Z"
  },
  "similar_tickets": [],
  "suggestions_for_operator": {
    "detected_category": "technical",
    "category_display": "Masalah Teknis",
    "suggestions": [...]
  }
}
```

### List Tickets Response

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 45,
    "per_page": 10,
    "current_page": 1,
    "last_page": 5
  }
}
```

### Analytics Response

```json
{
  "success": true,
  "period": {
    "start_date": "2026-04-01",
    "end_date": "2026-04-30"
  },
  "data": {
    "summary": {
      "total_tickets": 45,
      "closure_rate": 84.44,
      "average_response_time_minutes": 45.2
    },
    "admin_performance": [...],
    "satisfaction_stats": {...}
  }
}
```

## 🚀 Common Commands

### Backend

```bash
# Run migrations
php artisan migrate

# Generate test data
php artisan tinker
> factory(App\Models\User::class)->create(['role' => 'guru'])

# Check logs
tail -f storage/logs/laravel.log

# Clear cache
php artisan cache:clear
```

### Frontend

```bash
# Install dependencies
npm install

# Development
npm run dev

# Build
npm run build

# Test build
npm run start
```

### Database

```bash
# Backup
mysqldump -u user -p db_name > backup.sql

# Restore
mysql -u user -p db_name < backup.sql

# Check index
SHOW INDEX FROM tickets;

# Repair fulltext
REPAIR TABLE tickets;
```

## 🎨 UI Components Used

**From Existing Components:**

- `Alert.tsx` - Notification alerts
- `AuthGuard.tsx` - Authentication protection

**Styling:**

- Tailwind CSS (grid, spacing, colors)
- Custom responsive design
- Status/Priority color coding

## 🔄 State Management

**Frontend State:**

- `useState` for local component state
- Filters, loading, alert states managed locally
- No Redux/Context needed (simple app)

**Backend State:**

- Database is source of truth
- Services handle business logic
- Controllers handle HTTP layer

## 📱 Responsive Design

- Mobile: Single column layout
- Tablet: 2 columns for some sections
- Desktop: Full 3+ column layouts
- Touch-friendly buttons and inputs

## ♿ Accessibility

- Semantic HTML tags
- Form labels properly associated
- Color not only indicator (text labels)
- Keyboard navigation support
- Sufficient contrast ratios

## 🔍 Testing Tips

**Frontend:**

- Open browser DevTools
- Check Network tab for API calls
- Check Console for errors
- Use React DevTools extension

**Backend:**

- Use Postman/Insomnia to test API
- Check `storage/logs/laravel.log`
- Use `dd()` for quick debugging
- Use `php artisan tinker` for testing

## 📚 Related Documentation

- [Full Documentation](./HELPDESK_DOCUMENTATION.md)
- [Testing Guide](./HELPDESK_TESTING_GUIDE.md)
- [Backend Migration Files](../backend-absensi/database/migrations/)

## 🎯 Next Steps

1. **Test everything** using [Testing Guide](./HELPDESK_TESTING_GUIDE.md)
2. **Deploy** to staging environment
3. **User training** for all roles
4. **Monitor** performance and SLA metrics
5. **Gather feedback** for improvements

## 📞 Quick Troubleshooting

| Problem                | Solution                                 |
| ---------------------- | ---------------------------------------- |
| 404 Not Found          | Check route exists in routes/api.php     |
| 403 Forbidden          | Check middleware authorization           |
| 500 Error              | Check laravel.log for details            |
| Slow queries           | Check FULLTEXT index, run ANALYZE        |
| CORS error             | Check backend CORS configuration         |
| No suggestions         | Verify category detection keywords match |
| Duplicate not detected | Check FULLTEXT INDEX exists              |

---

**Quick Reference Version:** 1.0
**Last Updated:** April 23, 2026
