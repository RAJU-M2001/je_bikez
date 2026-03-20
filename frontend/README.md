# JE BikeZ - Frontend

Welcome to the frontend application for **JE BikeZ**, a premium custom bike modification studio specializing in LED upgrades, paint, and performance tuning. This interface provides a dynamic and engaging user experience for clients to explore features, view custom builds, and seamlessly book modification slots.

## 🚀 Features

- **Responsive Design**: Fully responsive layout optimized for mobile, tablet, and desktop viewing.
- **Dynamic Content**: Explore featured builds through an interactive image carousel.
- **Slot Booking**: Interactive booking form allowing users to submit their details (Name, Phone, Bike Model, Date) directly into the system.
- **Modern UI Elements**: Custom dialogs and clean navigation for a premium look and feel.

## 🛠️ Technology Stack

- **HTML5**: Semantic markup for accessible and SEO-friendly content structure.
- **CSS3**: Custom styling using a robust `style.css` without relying on heavy external frameworks. Features flexbox layouts and hardware-accelerated animations.
- **JavaScript (Vanilla)**: Lightweight DOM manipulation for the carousel, dynamic dialogs (About/Booking), and form submission handling (`script.js`).

## 📁 Project Structure

```
frontend/
├── index.html   # Main entry point and structural layout
├── style.css    # Comprehensive styling, variables, and responsive media queries
├── script.js    # Client-side logic for interactions and API communication
└── README.md    # Frontend documentation
```

## ⚙️ Getting Started

### Prerequisites

You simply need a modern web browser to view the frontend natively. For local development, a live server is recommended.

### Installation & Run

1. Clone or download the repository.
2. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
3. Open `index.html` in your preferred web browser, OR serve it locally using a simple HTTP server to avoid CORS issues if testing the API integration:
   - **Using VS Code**: Install the "Live Server" extension and click "Go Live".
   - **Using Python**: `python -m http.server 8000` (then visit `http://localhost:8000`).

## 🔌 API Integration

The frontend communicates with the Flask backend API via RESTful requests. 
The base logic for API requests is handled in `script.js`. If you need to change the API endpoint URL, update the fetch URL path in `script.js` accordingly.

- **Booking Endpoint**: `POST /book-slot`

### Configuration

Ensure your backend server is running and accessible (standard local testing port is typically configured in the backend configuration or `.env`).

## 🤝 Contributing

We welcome contributions to improve the JE BikeZ frontend. Please submit issues and pull requests following standard open-source conventions.

## 📄 License

&copy; 2026 JE BikeZ Studio. All rights reserved.
