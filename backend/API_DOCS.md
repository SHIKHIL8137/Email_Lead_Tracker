## Lead Tracker API

Base URL: `/api`

Auth: JWT sent as httpOnly cookie (`token`). All protected routes require authentication.

### Auth

POST `/auth/register`
- Body: `{ name: string, email: string, password: string }`
- Response: `{ user: { id, name, email } }`

POST `/auth/login`
- Body: `{ email: string, password: string }`
- Response: `{ user: { id, name, email } }`

POST `/auth/logout`
- Response: `{ message }`

### Leads (protected)

GET `/leads`
- Query: `status?, source?, q?, page=1, limit=10, sortBy=createdAt, sortOrder=desc`
- Response:
  ```json
  {
    "leads": [
      { "_id", "name", "email", "company", "status", "source", "lastEmailSentAt", "createdAt" }
    ],
    "pagination": { "total", "pages", "currentPage", "limit" },
    "stats": { "totalLeads", "byStatus": { "New": 5, ... } }
  }
  ```

POST `/leads`
- Body: `{ name, email, company?, phone?, status?, source?, notes? }`
- Response: `{ "_id", "name", "email", "company", "status", "source", "lastEmailSentAt", "createdAt" }`

GET `/leads/:id`
- Response: `{ "_id", "name", "email", "phone", "company", "status", "source", "notes", "lastEmailSentAt", "createdAt" }`

PUT `/leads/:id`
- Body: partial lead fields
- Response: `{ "_id", "name", "email", "company", "status", "source", "lastEmailSentAt", "createdAt" }`

DELETE `/leads/:id`
- Response: `{ message: "Deleted" }`

### Email Templates (protected)

GET `/email/templates`
- Response: `[{ "_id", "name", "subject", "createdAt", "updatedAt" }]`

GET `/email/templates/:id`
- Response: `{ "_id", "name", "subject", "body", "createdAt", "updatedAt" }`

POST `/email/templates`
- Body: `{ name, subject, body }`
- Response: `{ id, name, subject, createdAt }`

PUT `/email/templates/:id`
- Body: `{ name?, subject?, body? }`
- Response: `{ "_id", "name", "subject", "body", "updatedAt" }`

DELETE `/email/templates/:id`
- Response: `{ message }`

### Email Sending (protected)

POST `/email/campaigns`
- Body: `{ templateId?, leadIds?: [id], filters?: { status?, source?, q? }, subject?, body? }`
- Response: `{ message: "Campaign processed", results: { sent, failed, errors: [{ lead, message }] } }`

POST `/email/snippet`
- Body: `{ leadId?, templateId?, tone? }`
- Response: `{ body: string, html: string, provider: "sambanova" }`

POST `/email/send` (deprecated in favor of `/email/campaigns`)

### Email History (protected)

GET `/email/history`
- Query: `leadId?, status?, page=1, limit=100`
- Response:
  ```json
  {
    "data": [
      {
        "_id", "to", "subject", "status", "createdAt", "openedAt", "clickedAt",
        "previewUrl?", "lead": { "_id", "name" }, "template": { "_id", "name" }
      }
    ],
    "total": 123
  }
  ```

GET `/email/history/export?format=csv&leadId?`
- Response: CSV file stream

### Tracking (public)

GET `/email/track/open?hid=TRACK_ID`
- Side effect: marks history as opened (first time) and serves `public/logo.svg`
- Cache headers set to prevent caching

GET `/email/track/click?hid=TRACK_ID&url=ENCODED_URL`
- Side effect: marks history as clicked (first time) and redirects to URL (http/https only)

### Notes
- Only minimal, necessary fields are returned from the API to reduce payloads and avoid leaking sensitive data.
- Links in email HTML are auto-rewritten for click tracking server-side.
