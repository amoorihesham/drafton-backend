# DraftOn API Documentation

**Base URL:** `http://localhost:{PORT}/api/v1`

All responses follow a uniform envelope:

```json
{ "success": true,  "message": "...", "data": { ... } }
{ "success": false, "error": { "code": "...", "message": "..." } }
```

Prices are always in **cents** (e.g. `999` = $9.99).

---

## Authentication

Tokens are delivered and expected as **HttpOnly cookies** — no Authorization header needed.

| Cookie | Set by | Path | Lifetime |
|---|---|---|---|
| `access_token` | `POST /auth/login` | `/` | 7 days |
| `refresh_token` | `POST /auth/login` | `/auth/refresh` | 7 days |

---

### POST `/auth/register`

Register a new account. Sends a 6-digit OTP to the provided email for verification.

**Request body**

```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "min8chars"
}
```

| Field | Type | Rules |
|---|---|---|
| `email` | string | valid email format |
| `username` | string | 3–30 characters |
| `password` | string | min 8 characters |

**Response `201`**

```json
{
  "success": true,
  "message": "Registration successful. Please check your email for the verification link.",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "johndoe",
    "role": "client",
    "isEmailVerified": false,
    "isActive": true,
    "createdAt": "2026-04-20T00:00:00.000Z"
  }
}
```

**Errors**

| Code | Status | Meaning |
|---|---|---|
| `EMAIL_TAKEN` | 409 | Email already registered |
| `USERNAME_TAKEN` | 409 | Username already taken |

---

### POST `/auth/verify-email`

Verify the account using the OTP sent to the registered email.

**Request body**

```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

| Field | Type | Rules |
|---|---|---|
| `email` | string | valid email format |
| `otp` | string | exactly 6 characters |

**Response `201`**

```json
{
  "success": true,
  "message": "Email verified successfully. You can now log in.",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "johndoe",
    "role": "client",
    "isEmailVerified": true,
    "createdAt": "2026-04-20T00:00:00.000Z"
  }
}
```

**Errors**

| Code | Status | Meaning |
|---|---|---|
| `USER_NOT_FOUND` | 404 | No account for that email |
| `OTP_NOT_FOUND` | 404 | No pending OTP |
| `INVALID_OTP` | 401 | Wrong or expired OTP |

---

### POST `/auth/login`

Authenticate and receive session cookies.

**Request body**

```json
{
  "email": "user@example.com",
  "password": "min8chars",
  "deviceId": "device-uuid"
}
```

| Field | Type | Notes |
|---|---|---|
| `email` | string | |
| `password` | string | min 8 characters |
| `deviceId` | string | client-generated stable identifier per device |

**Response `200`** — also sets `access_token` and `refresh_token` cookies.

```json
{
  "success": true,
  "message": "Logged in successfully.",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "johndoe",
    "role": "client",
    "isEmailVerified": true,
    "isActive": true,
    "accessToken": "<jwt>",
    "createdAt": "2026-04-20T00:00:00.000Z"
  }
}
```

**Errors**

| Code | Status | Meaning |
|---|---|---|
| `USER_NOT_FOUND` | 404 | No account for that email |
| `INVALID_CREDENTIALS` | 401 | Wrong password |
| `EMAIL_NOT_VERIFIED` | 401 | Email not yet verified |

---

### POST `/auth/refresh`

Issue a new access token using the `refresh_token` cookie.

**Cookies required:** `refresh_token`

**Request body**

```json
{ "deviceId": "device-uuid" }
```

**Response `200`** — sets a new `access_token` cookie.

```json
{
  "success": true,
  "message": "Logged in successfully.",
  "data": { "accessToken": "<jwt>" }
}
```

**Errors**

| Code | Status | Meaning |
|---|---|---|
| `INVALID_REFRESH_TOKEN` | 400 | Cookie missing |
| `REFRESH_TOKEN_EXPIRED` | 401 | Token invalid or revoked |

---

### POST `/auth/logout/:userId`

Revoke the session for a specific device and clear cookies.

**Cookies required:** `access_token`

**Path param:** `userId` — the user's public UUID.

**Request body**

```json
{ "deviceId": "device-uuid" }
```

**Response `200`**

```json
{
  "success": true,
  "message": "Logged out successfully.",
  "data": {}
}
```

---

### GET `/auth/me`

Return the authenticated user's profile and active subscription.

**Cookies required:** `access_token`

**Response `200`**

```json
{
  "success": true,
  "message": "User profile fetched successfully.",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "johndoe",
      "role": "client",
      "isEmailVerified": true,
      "isActive": true,
      "createdAt": "2026-04-20T00:00:00.000Z",
      "updatedAt": "2026-04-20T00:00:00.000Z"
    },
    "subscription": {
      "planName": "free",
      "status": "active",
      "maxDocumentsPerDay": 5,
      "features": { "ai_generation": false, "priority_support": false, "custom_branding": false },
      "currentPeriodStart": "2026-04-20T00:00:00.000Z",
      "currentPeriodEnd": "9999-12-31T00:00:00.000Z",
      "trialEndsAt": null
    }
  }
}
```

`subscription` is `null` if no active subscription exists.

**Errors**

| Code | Status | Meaning |
|---|---|---|
| `INVALID_ACCESS_TOKEN` | 401 | Cookie missing |
| `ACCESS_TOKEN_EXPIRED` | 401 | Token invalid or expired |
| `USER_NOT_FOUND` | 404 | Account deleted after token was issued |

---

## Plans (Admin only)

All `/plans` endpoints require an `access_token` cookie belonging to a user with `role: "admin"`.

**Errors common to all plan endpoints**

| Code | Status | Meaning |
|---|---|---|
| `INVALID_ACCESS_TOKEN` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Authenticated but not admin |

---

### GET `/plans`

List all plans including inactive ones.

**Response `200`**

```json
{
  "success": true,
  "message": "Plans fetched successfully.",
  "data": [
    {
      "id": "uuid",
      "name": "free",
      "price_monthly": 0,
      "price_yearly": 0,
      "max_documents_per_day": 5,
      "features": { "ai_generation": false, "priority_support": false, "custom_branding": false },
      "stripe_product_id": null,
      "stripe_monthly_price_id": null,
      "stripe_yearly_price_id": null,
      "is_active": true,
      "created_at": "2026-04-20T00:00:00.000Z",
      "updated_at": "2026-04-20T00:00:00.000Z"
    }
  ]
}
```

---

### GET `/plans/:id`

Fetch a single plan by UUID.

**Path param:** `id` — plan UUID.

**Response `200`** — same shape as a single item in the list above.

**Errors**

| Code | Status | Meaning |
|---|---|---|
| `PLAN_NOT_FOUND` | 404 | No plan for that UUID |

---

### POST `/plans`

Create a new plan.

> Plan names are constrained to the DB enum: `free`, `pro`, `ultimate`. Adding a new name requires a schema migration.

**Request body**

```json
{
  "name": "pro",
  "price_monthly": 999,
  "price_yearly": 9990,
  "max_documents_per_day": 15,
  "features": { "ai_generation": true, "priority_support": false, "custom_branding": false },
  "stripe_product_id": "prod_xxx",
  "stripe_monthly_price_id": "price_xxx",
  "stripe_yearly_price_id": "price_yyy"
}
```

| Field | Type | Required | Rules |
|---|---|---|---|
| `name` | `"free" \| "pro" \| "ultimate"` | yes | |
| `price_monthly` | number | yes | cents, min 0 |
| `price_yearly` | number | yes | cents, min 0 |
| `max_documents_per_day` | number | yes | min 1 |
| `features` | object | no | free-form JSON |
| `stripe_product_id` | string | no | |
| `stripe_monthly_price_id` | string | no | |
| `stripe_yearly_price_id` | string | no | |

**Response `201`** — the created plan object.

---

### PATCH `/plans/:id`

Update plan fields. All body fields are optional — only send what needs changing.

**Path param:** `id` — plan UUID.

**Request body**

```json
{
  "price_monthly": 1299,
  "price_yearly": 12990,
  "max_documents_per_day": 20,
  "features": { "ai_generation": true, "priority_support": true, "custom_branding": false },
  "stripe_product_id": "prod_xxx",
  "stripe_monthly_price_id": "price_xxx",
  "stripe_yearly_price_id": "price_yyy",
  "is_active": true
}
```

**Response `200`** — the updated plan object.

**Errors**

| Code | Status | Meaning |
|---|---|---|
| `PLAN_NOT_FOUND` | 404 | No plan for that UUID |

---

### DELETE `/plans/:id`

Soft-deactivate a plan (`is_active` → `false`). The plan record is preserved for historical subscription data.

> Hard deletion is intentionally blocked — existing subscribers reference the plan via a `RESTRICT` foreign key.

**Path param:** `id` — plan UUID.

**Response `200`** — the deactivated plan object with `"is_active": false`.

**Errors**

| Code | Status | Meaning |
|---|---|---|
| `PLAN_NOT_FOUND` | 404 | No plan for that UUID |

---

## Subscription plans reference

| Plan | `max_documents_per_day` | Monthly price | Yearly price |
|---|---|---|---|
| `free` | 5 | $0 | $0 |
| `pro` | 15 | $9.99 | $99.90 |
| `ultimate` | 30 | $29.99 | $299.90 |

> Prices shown are seeded placeholders. Update via `PATCH /plans/:id` before going live.
