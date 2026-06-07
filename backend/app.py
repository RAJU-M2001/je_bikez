import os
from flask import Flask, request, jsonify, send_from_directory
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(BASE_DIR, ".env")
load_dotenv(env_path)

# Flask setup
FRONTEND_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "frontend")
)

app = Flask(__name__, static_folder=FRONTEND_DIR)
CORS(app)


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
collection = db["auth_user"]


# 📦 BOOK SLOT API
@app.route("/book-slot", methods=["POST"])
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


# 🔐 SIGNUP API
@app.route("/signup", methods=["POST"])
def signup():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data received"}), 400

        name = data.get("name")
        phone = data.get("phone")
        email = data.get("email")
        password = data.get("password")

        if not name or not phone or not email or not password:
            return jsonify({"error": "All fields are required"}), 400

        # Encrypt mobile and password
        encrypted_phone = generate_password_hash(phone)
        encrypted_password = generate_password_hash(password)

        new_user = {
            "name": name,
            "phone": encrypted_phone,
            "email": email,
            "password": encrypted_password
        }

        collection.insert_one(new_user)

        return jsonify({"message": "Signup successful!"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 🔐 LOGIN API
@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data received"}), 400

        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        user = collection.find_one({"email": email})

        if not user:
            return jsonify({"error": "This user is not available"}), 404

        if not check_password_hash(user["password"], password):
            return jsonify({"error": "Invalid password"}), 401

        return jsonify({"message": "Login successful!"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 🚀 Run app
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)