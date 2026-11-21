# MediQueue Backend

Node.js + Express.js + MongoDB/Mongoose REST API for MediQueue.

## Modules
- Authentication and role-based access
- Patients
- Appointments
- Digital queue/tokens
- Bed management
- Admission/discharge
- Digital prescriptions
- Medication safety alerts
- Hospital analytics

## Roles
patient, doctor, pharmacist, nurse, admin

## Setup
1. Install Node.js and MongoDB.
2. Copy `.env.example` to `.env`.
3. Set `MONGO_URI` and a strong `JWT_SECRET`.
4. Run `npm install`.
5. Optional demo data: `npm run seed`.
6. Start: `npm run dev` or `npm start`.
7. Health check: `GET http://localhost:5000/api/health`

## Demo accounts
All demo users use password `123456` after `npm run seed`.

- patient@mediqueue.com
- doctor@mediqueue.com
- pharmacist@mediqueue.com
- nurse@mediqueue.com
- admin@mediqueue.com

## API groups
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/auth/me`
- GET/POST/PUT `/api/patients`
- GET/POST/PUT/DELETE `/api/appointments`
- GET `/api/queue`
- POST `/api/queue/token`
- PUT `/api/queue/:id/status`
- GET `/api/queue/summary`
- GET/POST/PUT `/api/beds`
- GET `/api/beds/summary`
- GET/POST `/api/admissions`
- POST `/api/admissions/:id/discharge`
- GET/POST/PUT `/api/prescriptions`
- GET `/api/alerts`
- PUT `/api/alerts/:id/resolve`
- GET `/api/analytics/overview`
- GET `/api/analytics/department-queue`

## Frontend connection
The existing MediQueue frontend can call this API using `fetch()` and send the JWT in:
`Authorization: Bearer <token>`.

Example:
```js
const response = await fetch('http://localhost:5000/api/beds');
const result = await response.json();
```

For protected APIs:
```js
const response = await fetch('http://localhost:5000/api/appointments', {
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});
```

## Important
This backend is an academic/demo implementation. It is not suitable for real clinical deployment without professional security review, clinical validation, audit logging, privacy controls, infrastructure hardening and applicable healthcare compliance.
