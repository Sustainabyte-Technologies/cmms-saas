# CMMS Enterprise Mobile

Flutter mobile application for the CMMS SaaS backend.

## Static Prototype

This build is fully static for mobile view testing. It does not call `localhost:3001` or any backend API. All CMMS data is stored in memory inside the Flutter app.

## Static Test Login Fillers

The login screen includes quick-fill chips for view testing:

- `admin@cmms.com` / `Admin@123`
- `manager@cmms.com` / `Manager@123`
- `supervisor@cmms.com` / `Supervisor@123`
- `technician@cmms.com` / `Tech@123`

These values log into the static local session.

## Implemented Modules

- Static authentication, secure session storage, session restore, logout
- Role-based navigation for Admin, Maintenance Manager, Supervisor/Site Incharge, and Technician
- Enterprise dashboard with KPIs, work-order status chart, recent activities
- Customer, site, department, and system portfolio management
- User management
- Asset management with image upload endpoint support
- Work-order management with create, search, filter, assign technician, status updates, notes, attachments, timeline/details
- Checklist templates
- Preventive maintenance schedules
- Notifications from recent activity and critical work-order endpoints
- Global search across static portfolio, users, assets, and work orders
- Light and dark themes

## Verification

```bash
flutter pub get
dart format lib test
flutter analyze
flutter test
```
