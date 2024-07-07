# Stage 2 Task: User Authentication & Organisation

## Acceptance Criteria

### Database Connection
- Connect your application to a PostgreSQL database server. 
- (Optional) You can choose to use any ORM of your choice if you want or not.

### User Model
Create a User model with the following properties:
```json
{
  "userId": "string", // must be unique
  "firstName": "string", // must not be null
  "lastName": "string", // must not be null
  "email": "string", // must be unique and must not be null
  "password": "string", // must not be null
  "phone": "string"
}
```
Provide validation for all fields. When there’s a validation error, return status code 422 with payload:
```json
{
  "errors": [
    {
      "field": "string",
      "message": "string"
    }
  ]
}
```

### User Authentication
#### User Registration
- Implement an endpoint for user registration.
- Hash the user’s password before storing it in the database.
- Successful response: Return the payload with a 201 success status code.

#### User Login
- Implement an endpoint for user Login.
- Use the JWT token returned to access PROTECTED endpoints.

### Organisation
- A user can belong to one or more organisations.
- An organisation can contain one or more users.
- On every registration, an organisation must be created.
- The name property of the organisation takes the user’s `firstName` and appends “Organisation” to it. For example: user’s first name is John, organisation name becomes "John's Organisation".

### Organisation Model
Create an organisation model with the following properties:
```json
{
  "orgId": "string", // Unique
  "name": "string", // Required and cannot be null
  "description": "string"
}
```

## Endpoints

### [POST] /auth/register
Registers a user and creates a default organisation.
#### Request Body
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "password": "string",
  "phone": "string"
}
```
#### Successful Response
```json
{
  "status": "success",
  "message": "Registration successful",
  "data": {
    "accessToken": "eyJh...",
    "user": {
      "userId": "string",
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "phone": "string"
    }
  }
}
```
#### Unsuccessful Registration Response
```json
{
  "status": "Bad request",
  "message": "Registration unsuccessful",
  "statusCode": 400
}
```

### [POST] /auth/login
Logs in a user. When you log in, you can select an organisation to interact with.
#### Request Body
```json
{
  "email": "string",
  "password": "string"
}
```
#### Successful Response
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "accessToken": "eyJh...",
    "user": {
      "userId": "string",
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "phone": "string"
    }
  }
}
```
#### Unsuccessful Login Response
```json
{
  "status": "Bad request",
  "message": "Authentication failed",
  "statusCode": 401
}
```

### [GET] /api/users/:id
A user gets their own record or user record in organisations they belong to or created [PROTECTED].
#### Successful Response
```json
{
  "status": "success",
  "message": "<message>",
  "data": {
    "userId": "string",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phone": "string"
  }
}
```

### [GET] /api/organisations
Gets all organisations the user belongs to or created. If a user is logged in properly, they can get all their organisations. They should not get another user’s organisation [PROTECTED].
#### Successful Response
```json
{
  "status": "success",
  "message": "<message>",
  "data": {
    "organisations": [
      {
        "orgId": "string",
        "name": "string",
        "description": "string"
      }
    ]
  }
}
```

### [GET] /api/organisations/:orgId
The logged in user gets a single organisation record [PROTECTED].
#### Successful Response
```json
{
  "status": "success",
  "message": "<message>",
  "data": {
    "orgId": "string",
    "name": "string",
    "description": "string"
  }
}
```

### [POST] /api/organisations
A user can create their new organisation [PROTECTED].
#### Request Body
Request body must be validated
```json
{
  "name": "string", // Required and cannot be null
  "description": "string"
}
```
#### Successful Response
```json
{
  "status": "success",
  "message": "Organisation created successfully",
  "data": {
    "orgId": "string",
    "name": "string",
    "description": "string"
  }
}
```
#### Unsuccessful Response
```json
{
  "status": "Bad Request",
  "message": "Client error",
  "statusCode": 400
}
```

### [POST] /api/organisations/:orgId/users
Adds a user to a particular organisation.
#### Request Body
```json
{
  "userId": "string"
}
```
#### Successful Response
```json
{
  "status": "success",
  "message": "User added to organisation successfully"
}
```

## Unit Testing

### Token Generation
- Ensure the token expires at the correct time and correct user details are found in the token.

### Organisation
- Ensure users can’t see data from organisations they don’t have access to.

## End-to-End Test Requirements for the Register Endpoint

### Test Scenarios
1. **It Should Register User Successfully with Default Organisation:**
   - Ensure a user is registered successfully when no organisation details are provided.
   - Verify the default organisation name is correctly generated (e.g., "John's Organisation" for a user with the first name "John").
   - Check that the response contains the expected user details and access token.

2. **It Should Log the User in Successfully:**
   - Ensure a user is logged in successfully when valid credentials are provided and fails otherwise.
   - Check that the response contains the expected user details and access token.

3. **It Should Fail If Required Fields Are Missing:**
   - Test cases for each required field (firstName, lastName, email, password) missing.
   - Verify the response contains a status code of 422 and appropriate error messages.

4. **It Should Fail if There’s Duplicate Email or UserID:**
   - Attempt to register two users with the same email.
   - Verify the response contains a status code of 422 and appropriate error messages.

## Directory Structure
The test file should be named `auth.spec.ext` (ext is the file extension of your chosen language) inside a folder named `tests`. For example `tests/auth.spec.ts` assuming you’re using TypeScript.

## How to Submit
1. Host your API on a free hosting service as you did with stage 1.
2. Only submit the endpoint’s base URL. E.g., `https://example.com`
3. A Google form will be provided for submission.

### Submission Deadline
- The deadline for submissions is Sunday, 7th July 2024 at 11:59 PM GMT. Late submissions will not be entertained.

### Submission Mode
Submit your task through the designated submission form. Ensure you've:
1. Hosted the page on a platform of your choice.
2. Double-checked all requirements and acceptance criteria.
3. Provided the hosted page's URL in the submission form.

Thoroughly review your work to ensure accuracy, functionality, and adherence to the specified guidelines before you submit it.