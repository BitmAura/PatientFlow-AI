# API Documentation

## Authentication

All protected routes require a valid Supabase session token in the `Authorization` header or cookie (managed by Next.js middleware).

```http
Authorization: Bearer <access_token>
```

Public routes (like booking) use API keys or are open.

## Resources

### Appointments

#### `GET /api/appointments`
List appointments with filtering.

**Query Params:**
- `date_from` (ISO Date)
- `date_to` (ISO Date)
- `status` (pending, confirmed, etc.)
- `doctor_id` (UUID)

**Response:**
```json
[
  {
    "id": "uuid",
    "start_time": "2024-01-01T10:00:00Z",
    "patient": { ... },
    "service": { ... }
  }
]
```

#### `POST /api/appointments`
Create a new appointment (Internal).

**Body:**
```json
{
  "patient_id": "uuid",
  "service_id": "uuid",
  "doctor_id": "uuid",
  "scheduled_date": "2024-01-01",
  "scheduled_time": "10:00"
}
```

### Doctors

#### `GET /api/doctors`
List all active doctors.

#### `GET /api/doctors/:id/availability`
Get availability schedule for a doctor.

#### `PUT /api/doctors/:id/availability`
Update availability.

**Body:**
```json
{
  "use_clinic_hours": false,
  "custom_hours": {
    "monday": { "open": "09:00", "close": "14:00", "is_off": false }
  }
}
```

### Waiting List

#### `POST /api/waiting-list`
Add patient to waiting list.

**Body:**
```json
{
  "patient_id": "uuid",
  "service_id": "uuid",
  "preferred_date_from": "2024-01-01",
  "preferred_date_to": "2024-01-05",
  "priority": "medium"
}
```

#### `POST /api/waiting-list/:id/notify`
Manually notify a patient of an opening.

### Public Booking

#### `GET /api/booking/:slug`
Get clinic details, services, and doctors for booking page.

#### `GET /api/booking/:slug/slots`
Get available time slots.

**Query Params:**
- `date` (YYYY-MM-DD)
- `service_id` (UUID)
- `doctor_id` (UUID, optional)

## Error Codes

- `400 Bad Request`: Validation failed.
- `401 Unauthorized`: Missing or invalid token.
- `403 Forbidden`: User does not have permission.
- `404 Not Found`: Resource does not exist.
- `429 Too Many Requests`: Rate limit exceeded (WhatsApp/Email).
- `500 Internal Server Error`: Server-side issue.

## Rate Limits

- **Public Booking**: 10 requests per minute per IP.
- **WhatsApp Sending**: 50 messages per minute per clinic.
