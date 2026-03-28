import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_httpauth import HTTPBasicAuth
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Flask setup
FRONTEND_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "frontend")
)

app = Flask(__name__, static_folder=FRONTEND_DIR)
CORS(app)

auth = HTTPBasicAuth()

# 🔐 Read credentials from ENV
USERNAME = os.getenv("AUTH_USER", "admin")
PASSWORD = os.getenv("AUTH_PASS", "jebikez123")


@auth.verify_password
def verify_password(username, password):
    if username == USERNAME and password == PASSWORD:
        return username
    return None


# 🔐 GLOBAL AUTH LOCK (applies to ALL routes)
@app.before_request
def require_auth():
    # Allow health check (needed for Render)
    if request.path == "/health":
        return "OK", 200

    return auth.login_required(lambda: None)()


# ✅ Serve index.html
@app.route("/")
def home():
    return send_from_directory(FRONTEND_DIR, "index.html")


# ✅ Serve all static files (CSS, JS, images)
@app.route("/<path:path>")
def serve_static(path):
    return send_from_directory(FRONTEND_DIR, path)


# 🔗 MongoDB Setup
mongo_uri = os.getenv("MONGO_URI")
db_name = os.getenv("DB_NAME")
collection_name = os.getenv("COLLECTION_NAME")

client = MongoClient(mongo_uri, tls=True)
db = client[db_name]
collection = db[collection_name]


# 📦 BOOK SLOT API (also protected)
@app.route("/book-slot", methods=["POST"])
@auth.login_required
def book_slot():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data received"}), 400

        name = data.get("name")
        phone = data.get("phone")
        bike = data.get("bike")
        date = data.get("date")

        if not name or not phone or not bike or not date:
            return jsonify({"error": "All fields are required"}), 400

        booking = {
            "name": name,
            "phone": phone,
            "bike": bike,
            "date": date
        }

        collection.insert_one(booking)

        return jsonify({"message": "Slot booked successfully"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 🚀 Run app
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)