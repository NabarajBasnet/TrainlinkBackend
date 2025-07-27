# Training Request API Documentation

## Overview

This API provides endpoints for managing training requests in the Trainlink application. Training requests allow members to create requests for training programs that trainers can view and respond to.

## Authentication

All protected endpoints require authentication via JWT token stored in cookies. The token is automatically set when users log in.

## Endpoints

### 1. Create Training Request

- **POST** `/api/create-training-request`
- **Authentication**: Required
- **Description**: Create a new training request
- **Body**:
  ```json
  {
    "goal": "I want to lose 10 kg in 5 months",
    "description": "Detailed description of training goals",
    "preferredDaysPerWeek": 3,
    "budgetPerWeek": 199.99,
    "availableTimeSlots": ["Morning", "Evening"],
    "status": "Active"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Training request created successfully",
    "data": {
      /* training request object */
    }
  }
  ```

### 2. Get My Training Requests

- **GET** `/api/get-my-training-requests`
- **Authentication**: Required
- **Description**: Get all training requests for the authenticated user
- **Response**:
  ```json
  {
    "success": true,
    "message": "Training requests fetched successfully",
    "trainingRequests": [
      /* array of training requests */
    ]
  }
  ```

### 3. Get Training Request by ID

- **GET** `/api/get-training-request/:id`
- **Authentication**: Required
- **Description**: Get a specific training request by ID
- **Response**:
  ```json
  {
    "success": true,
    "message": "Training request fetched successfully",
    "trainingRequest": {
      /* training request object */
    }
  }
  ```

### 4. Update Training Request

- **PUT** `/api/update-training-request/:id`
- **Authentication**: Required
- **Description**: Update an existing training request
- **Body**: Same as create endpoint
- **Response**:
  ```json
  {
    "success": true,
    "message": "Training request updated successfully",
    "trainingRequest": {
      /* updated training request object */
    }
  }
  ```

### 5. Delete Training Request

- **DELETE** `/api/delete-training-request/:id`
- **Authentication**: Required
- **Description**: Delete a specific training request
- **Response**:
  ```json
  {
    "success": true,
    "message": "Training request deleted successfully"
  }
  ```

### 6. Delete Multiple Training Requests

- **DELETE** `/api/delete-training-requests`
- **Authentication**: Required
- **Description**: Delete multiple training requests
- **Body**:
  ```json
  {
    "requestIds": ["id1", "id2", "id3"]
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "3 training request(s) deleted successfully"
  }
  ```

### 7. Get All Training Requests (Public)

- **GET** `/api/get-all-training-requests`
- **Authentication**: Optional
- **Description**: Get all training requests with pagination and filtering
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `status`: Filter by status
  - `search`: Search in goal and description
- **Response**:
  ```json
  {
    "success": true,
    "message": "Training requests fetched successfully",
    "trainingRequests": [
      /* array of training requests */
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10
    }
  }
  ```

## Training Request Model

```typescript
{
  _id: ObjectId,
  memberId: ObjectId, // Reference to User
  goal: String, // Required
  description: String, // Required
  preferredDaysPerWeek: Number, // Required
  budgetPerWeek: Number, // Required
  availableTimeSlots: [String], // Array of time slots
  status: String, // "Active" | "Inactive" | "Disabled" | "Pending"
  createdAt: Date,
  updatedAt: Date
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (optional)"
}
```

Common HTTP status codes:

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## Frontend Integration

The frontend component `trainingRequest.tsx` is already configured to work with these endpoints. It includes:

- Form validation using Zod schema
- React Query for data fetching and caching
- Toast notifications for success/error messages
- Bulk delete functionality
- Edit/update capabilities
- Real-time form state management

## Setup

1. Ensure all dependencies are installed:

   ```bash
   npm install
   ```

2. Set up environment variables:

   ```
   JWT_SECRET=your_jwt_secret_here
   JWT_EXPIRES_IN=7d
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:4000/api/`
