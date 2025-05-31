# Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant DB as Database
    participant E as Email Service

    %% Registration Flow
    rect rgb(200, 220, 255)
        Note over U,E: Registration Process
        U->>F: 1. Enter registration details
        F->>F: 2. Validate input
        F->>B: 3. Send registration request
        B->>B: 4. Hash password
        B->>DB: 5. Save user data
        B->>E: 6. Send verification email
        E->>U: 7. Receive verification link
        U->>B: 8. Click verification link
        B->>DB: 9. Update verification status
        B->>F: 10. Confirm verification
        F->>U: 11. Show success message
    end

    %% Login Flow
    rect rgb(220, 255, 220)
        Note over U,E: Login Process
        U->>F: 1. Enter login credentials
        F->>F: 2. Validate input
        F->>B: 3. Send login request
        B->>DB: 4. Verify credentials
        B->>B: 5. Generate JWT tokens
        B->>F: 6. Return tokens
        F->>F: 7. Store tokens
        F->>U: 8. Redirect to dashboard
    end

    %% Password Reset Flow
    rect rgb(255, 220, 220)
        Note over U,E: Password Reset Process
        U->>F: 1. Request password reset
        F->>B: 2. Send reset request
        B->>DB: 3. Verify user exists
        B->>E: 4. Send reset email
        E->>U: 5. Receive reset link
        U->>F: 6. Enter new password
        F->>B: 7. Send new password
        B->>B: 8. Hash new password
        B->>DB: 9. Update password
        B->>F: 10. Confirm reset
        F->>U: 11. Show success message
    end
```

## Authentication Flow Explanation

### 1. Registration Process
1. User enters registration details (email, password, etc.)
2. Frontend validates input format
3. Registration request sent to backend
4. Password is hashed using bcrypt
5. User data saved in MongoDB
6. Verification email sent via SendGrid
7. User receives email with verification link
8. User clicks verification link
9. Backend updates user verification status
10. Frontend confirms verification
11. Success message shown to user

### 2. Login Process
1. User enters email and password
2. Frontend validates input format
3. Login request sent to backend
4. Backend verifies credentials against database
5. JWT access and refresh tokens generated
6. Tokens returned to frontend
7. Tokens stored in secure storage
8. User redirected to dashboard

### 3. Password Reset Process
1. User requests password reset
2. Frontend sends reset request
3. Backend verifies user exists
4. Reset email sent via SendGrid
5. User receives email with reset link
6. User enters new password
7. New password sent to backend
8. New password hashed
9. Database updated with new password
10. Reset confirmed
11. Success message shown to user

## Security Measures

- **Password Security**
  - Passwords hashed using bcrypt
  - Minimum password requirements enforced
  - Password history checked

- **Token Security**
  - JWT tokens with expiration
  - Refresh token rotation
  - Secure token storage

- **Email Security**
  - Verified sender domains
  - Rate limiting on email sends
  - Email template validation

- **API Security**
  - Rate limiting on auth endpoints
  - Input validation and sanitization
  - HTTPS enforced 