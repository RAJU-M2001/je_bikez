# JE BikeZ - Backend API

This repository contains the backend service for **JE BikeZ**, a premium custom bike modification studio. Built with Python and Flask, this RESTful API processes client bookings, integrates securely with a MongoDB database, and ensures cross-origin resource sharing (CORS) is handled to support the frontend application.

## 🚀 Features

- **RESTful Endpoints**: Clean and structured API routing.
- **Secure Data Storage**: Integration with MongoDB over TLS.
- **Environment Configuration**: Safe credential management using `.env`.
- **Cross-Origin Resource Sharing (CORS)**: Configured seamlessly to allow frontend communications from separate origins.
- **Container / Production Ready**: Setup includes standard production-ready artifacts like `gunicorn` in `requirements.txt`.

## 🛠️ Technology Stack

- **Python 3.x**: Language runtime.
- **Flask (v3.1.x)**: Lightweight web framework for handling API requests.
- **PyMongo (v4.16.x)**: Python driver for MongoDB integration natively supporting TLS.
- **Flask-CORS**: Extension for managing cross-origin requests.
- **python-dotenv**: Tool for managing environment variables.
- **Gunicorn**: Python WSGI HTTP Server for UNIX, providing production readiness.

## 📁 Project Structure

```
backend/
├── app.py              # Main Flask application and API route definitions
├── requirements.txt    # Python dependencies list
├── .env.example        # Example environment configuration (to be created based on .env)
├── .gitignore          # Excludes build output and secrets like .env
└── README.md           # Backend documentation
```

## ⚙️ Getting Started

### Prerequisites

- Python 3.8+ installed on your system.
- A MongoDB cluster (e.g., MongoDB Atlas) with connection credentials.

### Installation

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment (recommended):
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Configuration

Create a `.env` file in the root of the `backend` directory. Use the following template:

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
DB_NAME=jebikez_db
COLLECTION_NAME=bookings
PORT=10000
```
*(Replace the placeholder values with your actual MongoDB credentials and desired database configurations.)*

### Running the Application

**Development Mode:**
Start the development server:
```bash
python app.py
```
The API will be accessible at `http://0.0.0.0:10000` (or whichever port is defined in your `.env`).

**Production Mode:**
For production deployment, it is recommended to use Gunicorn:
```bash
gunicorn -w 4 -b 0.0.0.0:10000 app:app
```

## 📚 API Endpoints

### 1. Health Check
- **Endpoint**: `GET /`
- **Description**: Verifies if the backend server is running correctly.
- **Response**:
  ```json
  {
    "message": "Bike Modification API Running"
  }
  ```

### 2. Book Slot
- **Endpoint**: `POST /book-slot`
- **Description**: Submits a new booking request to the database.
- **Request Body (JSON)**:
  ```json
  {
    "name": "Jane Doe",
    "phone": "+1234567890",
    "bike": "Yamaha R1",
    "date": "2026-04-10"
  }
  ```
- **Responses**:
  - `200 OK`: `{"message": "Slot booked successfully"}`
  - `400 Bad Request`: `{"error": "All fields are required"}`
  - `500 Internal Server Error`: `{"error": "<Exception Details>"}`

## 🤝 Contributing

We welcome contributions. Before submitting major changes, please open an issue to discuss your proposed updates.

## 📄 License

&copy; 2026 JE BikeZ Studio. All rights reserved.
