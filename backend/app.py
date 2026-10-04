import os
from flask import Flask, request, jsonify, send_from_directory
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
from bson import ObjectId
import cloudinary
import cloudinary.uploader
import cloudinary.api
import time
from threading import Thread
from datetime import datetime, UTC



# Load environment variables
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(BASE_DIR, ".env")
load_dotenv(env_path)

# Flask setup
FRONTEND_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "frontend")
)

app = Flask(__name__, static_folder=FRONTEND_DIR)
app.config["MAX_CONTENT_LENGTH"] = int(os.getenv("MAX_UPLOAD_SIZE"))
CORS(app)

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

print(cloudinary.api.ping())
# ✅ Serve index.html
@app.route("/")
def home():
    return send_from_directory(FRONTEND_DIR, "index.html")


# ✅ Serve all static files (CSS, JS, images) — never intercept /api/* routes
@app.route("/<path:path>", methods=["GET"])
def serve_static(path):
    if path.startswith("api/"):
        from flask import abort
        abort(404)
    return send_from_directory(FRONTEND_DIR, path)


# 🔗 MongoDB Setup
mongo_uri = os.getenv("MONGO_URI")
db_name = os.getenv("DB_NAME")
collection_name = os.getenv("COLLECTION_NAME")
user = os.getenv("USER")
modification=os.getenv("MODIFICATION")
book_sales = os.getenv("BOOK_SALES") or os.getenv("BOOK_SALE") or "book-sales"


client = MongoClient(mongo_uri, tls=True)
db = client[db_name]
collection = db[collection_name]
user_collection = db[user]
modification_collection = db[modification]
book_sales_collection = db[book_sales]


# Health Check API
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "success": True,
        "status": "UP",
        "message": "JE Bikez API is running"
    }), 200

# CONFIG API
@app.route("/api/config", methods=["GET"])
def get_config():
    try:
        theme = os.getenv("THEME", "light").strip().lower()

        return jsonify({
            "success": True,
            "theme": theme
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Failed to load configuration",
            "error": str(e)
        }), 500


# 📦 BOOK SLOT API
@app.route("/api/book-slot", methods=["POST"])
def book_slot():

    try:

        data = request.get_json()

        if not data:
            return jsonify({
                "error": "No data received"
            }), 400

        name = data.get("name")
        phone = data.get("phone")
        bike = data.get("bike")
        date = data.get("date")

        if not name or not phone or not bike or not date:
            return jsonify({
                "error": "All fields are required"
            }), 400

        collection.insert_one({
            "name": name,
            "phone": phone,
            "bike": bike,
            "date": date
        })

        return jsonify({
            "success": True,
            "message": "Slot booked successfully"
        }), 201

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500

# 📦 MODIFICATION SLOT API
@app.route("/api/modification-slot", methods=["POST"])
def modification_slot():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data received"}), 400
            
        name = data.get("name")
        phone = data.get("phone")
        email = data.get("email")
        bike = data.get("bike")
        
        if not name or not bike:
            return jsonify({"error": "Name and Bike details are required"}), 400
            
        if not phone and not email:
            return jsonify({"error": "Either Phone or Email is required"}), 400
            
        modification_collection.insert_one({
            "name": name,
            "phone": phone,
            "email": email,
            "bike": bike,
            "type": "modification_slot",
            "date": datetime.now(UTC)
        })
        
        return jsonify({"success": True, "message": "Slot booked successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 🔐 SIGNUP API
@app.route("/api/auth/signup", methods=["POST"])
def signup():

    try:

        data = request.get_json()

        if not data:
            return jsonify({
                "error": "No data received"
            }), 400

        name = data.get("name")
        phone = data.get("phone")
        email = data.get("email")
        password = data.get("password")

        if not name or not phone or not email or not password:
            return jsonify({
                "error": "All fields are required"
            }), 400

        email = email.lower()

        existing_user = user_collection.find_one({
            "email": email
        })

        if existing_user:
            return jsonify({
                "error": "User already exists"
            }), 409
        
        hashed_password = generate_password_hash(password)
        
        new_user = {
            "name": name,
            "phone": phone,
            "email": email,
            "password": hashed_password,
            "profile_picture": "",
            "profile_picture_id": "",
            "created_at": datetime.now(UTC),
            "updated_at": datetime.now(UTC)
        }

        result = user_collection.insert_one(new_user)

        return jsonify({
            "user_id": str(result.inserted_id),
            "success": True,
            "message": "Signup successful"
        }), 201

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500


# 🔐 LOGIN API
@app.route("/api/auth/login", methods=["POST"])
def login():

    try:

        data = request.get_json()

        if not data:
            return jsonify({
                "error": "No data received"
            }), 400

        email = data.get("email")
        password = data.get("password")
        

        if not email or not password:
            return jsonify({
                "error": "Email and password are required"
            }), 400

        user = user_collection.find_one({
            "email": email.lower()
        })

        if not user:
            return jsonify({
                "error": "User not found"
            }), 404

        if not check_password_hash(
            user["password"],
            password
        ):
            return jsonify({
                "error": "Invalid password"
            }), 401

        # Update updated_at after successful login
        user_collection.update_one(
            {
                "_id": user["_id"]
            },
            {
                "$set": {
                    "updated_at": datetime.now(UTC)
                }
            }
        )

        return jsonify({
            "success": True,
            "message": "Login successful",
            "user": {
                "id": str(user["_id"]),
                "name": user["name"],
                "email": user["email"],
                "profile_picture": user.get(
                    "profile_picture",
                    ""
                )
            }
        }), 200

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500


# Get User Profile API
@app.route("/api/user/<user_id>", methods=["GET"])
def get_profile(user_id):

    try:

        user = user_collection.find_one(
            {"_id": ObjectId(user_id)},
            {"password": 0}
        )

        if not user:
            return jsonify({
                "error": "User not found"
            }), 404

        user["_id"] = str(user["_id"])

        return jsonify({
            "success": True,
            "user": user
        }), 200

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500

#User path the user data from database to frontend
@app.route("/api/user/<user_id>", methods=["PATCH"])
def update_profile(user_id):

    try:

        user = user_collection.find_one({
            "_id": ObjectId(user_id)
        })

        if not user:
            return jsonify({
                "error": "User not found"
            }), 404

        # Initialize update_data with updated_at
        update_data = {
            "updated_at": datetime.now(UTC)
        }

        # Name update
        name = request.form.get("name")

        if name:
            update_data["name"] = name

        # Profile image update
        if "image" in request.files:

            image = request.files["image"]

            old_public_id = user.get(
                "profile_picture_id"
            )

            if old_public_id:
                cloudinary.uploader.destroy(
                    old_public_id
                )

            result = cloudinary.uploader.upload(
                image,
                folder=os.getenv("CLOUDINARY_FOLDER")
            )

            update_data["profile_picture"] = (
                result["secure_url"]
            )

            update_data["profile_picture_id"] = (
                result["public_id"]
            )

        # Update MongoDB
        user_collection.update_one(
            {
                "_id": ObjectId(user_id)
            },
            {
                "$set": update_data
            }
        )

        updated_user = user_collection.find_one(
            {
                "_id": ObjectId(user_id)
            },
            {
                "password": 0
            }
        )

        updated_user["_id"] = str(
            updated_user["_id"]
        )

        return jsonify({
            "success": True,
            "message": "Profile updated successfully",
            "user": updated_user
        }), 200

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500


def delete_user_after_delay(user_id):
    try:
        # Wait for 2 minutes
        time.sleep(120)

        # Find user whose account is marked for deletion
        user = user_collection.find_one({
            "_id": ObjectId(user_id),
            "deleted_account": True
        })

        if not user:
            print("User not found or deletion cancelled.")
            return

        # Delete profile image from Cloudinary
        public_id = user.get("profile_picture_id")

        if public_id:
            result = cloudinary.uploader.destroy(public_id)

            # Proceed only if image is deleted or doesn't exist
            if result.get("result") not in ["ok", "not found"]:
                print("Failed to delete Cloudinary image.")
                return

        # Delete user from MongoDB
        user_collection.delete_one({
            "_id": ObjectId(user_id)
        })

        print(f"User {user_id} deleted successfully.")

    except Exception as e:
        print(f"Delete Error: {e}")


@app.route("/api/user/<user_id>", methods=["DELETE"])
def delete_account(user_id):
    try:
        # Check if user exists
        user = user_collection.find_one({
            "_id": ObjectId(user_id)
        })

        if not user:
            return jsonify({
                "success": False,
                "message": "User not found."
            }), 404

        # Mark account as deleted
        user_collection.update_one(
            {
                "_id": ObjectId(user_id)
            },
            {
                "$set": {
                    "deleted_account": True,
                    "deleted_at": datetime.utcnow()
                }
            }
        )

        # Start background deletion
        Thread(
            target=delete_user_after_delay,
            args=(user_id,),
            daemon=True
        ).start()

        return jsonify({
            "success": True,
            "message": "Your account has been scheduled for deletion. It will be permanently deleted in 2 minutes."
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# 📦 SERVICE HISTORY API
@app.route("/api/service-history/<user_id>", methods=["GET"])
def get_service_history(user_id):
    try:
        history_coll = db["service_history"]
        records = list(history_coll.find({"user_id": user_id}, {"_id": 0}))
        for r in records:
            if isinstance(r.get("date"), datetime):
                r["date"] = r["date"].isoformat()
        return jsonify({"success": True, "history": records}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# 📦 BOOK SERVICE API
# @app.route("/api/book-service", methods=["POST"])
# def book_service():
#     try:
#         data = request.get_json() or {}
#         data["created_at"] = datetime.now(UTC)
#         data.setdefault("user_id", "demo-user")
#         data.setdefault("status", "Pending")
#         db["service_history"].insert_one(data)
#         return jsonify({"success": True, "message": "Service booked successfully"}), 201
#     except Exception as e:
#         return jsonify({"success": False, "error": str(e)}), 500

# ============================================================
# 📦 SERVICE BOOKING API
# ============================================================

@app.route("/api/book-service", methods=["POST"])
def book_service():

    try:

        # --------------------------------------------------------
        # READ JSON BODY
        # --------------------------------------------------------

        data = request.get_json(silent=True)

        if not data:

            return jsonify({
                "success": False,
                "error": "Request body must contain JSON data."
            }), 400


        # --------------------------------------------------------
        # REQUIRED FIELDS
        # --------------------------------------------------------

        required_fields = [
            "user_id",
            "manufacturer",
            "model",
            "variant",
            "year",
            "cc",
            "serviceType",
            "date"
        ]


        # --------------------------------------------------------
        # CHECK REQUIRED FIELDS
        # --------------------------------------------------------

        missing_fields = [
            field
            for field in required_fields
            if data.get(field) is None
            or str(data.get(field)).strip() == ""
        ]


        if missing_fields:

            return jsonify({
                "success": False,
                "error": "Required booking information is missing.",
                "fields": missing_fields
            }), 400


        # --------------------------------------------------------
        # CLEAN VALUES
        # --------------------------------------------------------

        user_id = str(
            data["user_id"]
        ).strip()

        manufacturer = str(
            data["manufacturer"]
        ).strip()

        model = str(
            data["model"]
        ).strip()

        variant = str(
            data["variant"]
        ).strip()

        year = str(
            data["year"]
        ).strip()

        cc = str(
            data["cc"]
        ).strip()

        service_type = str(
            data["serviceType"]
        ).strip()

        booking_date = str(
            data["date"]
        ).strip()


        # --------------------------------------------------------
        # CREATE BOOKING DOCUMENT
        # --------------------------------------------------------

        booking_data = {

            "user_id": user_id,

            "bike": {

                "manufacturer": manufacturer,

                "model": model,

                "variant": variant,

                "year": year,

                "cc": cc
            },

            "serviceType": service_type,

            "date": booking_date,

            "status": "Pending",

            "created_at": datetime.now(UTC),

            "updated_at": datetime.now(UTC)
        }


        # --------------------------------------------------------
        # INSERT INTO MONGODB
        # --------------------------------------------------------

        collection = db["service-booking"]

        result = collection.insert_one(
            booking_data
        )


        # --------------------------------------------------------
        # SUCCESS RESPONSE
        # --------------------------------------------------------

        return jsonify({

            "success": True,

            "message": "Service booked successfully.",

            "booking": {

                "booking_id":
                    str(result.inserted_id),

                "user_id":
                    user_id,

                "manufacturer":
                    manufacturer,

                "model":
                    model,

                "variant":
                    variant,

                "year":
                    year,

                "cc":
                    cc,

                "serviceType":
                    service_type,

                "date":
                    booking_date,

                "status":
                    "Pending"
            }

        }), 201


    # ------------------------------------------------------------
    # GENERAL ERROR
    # ------------------------------------------------------------

    except Exception as e:

        print(
            "❌ BOOK SERVICE ERROR:",
            str(e)
        )


        return jsonify({

            "success": False,

            "error":
                "Unable to book service.",

            "details":
                str(e)

        }), 500






# ============================================================
# 📦 SALES BIKE BOOKING REQUEST API
# ============================================================

@app.route("/api/book-sale", methods=["POST"])
def book_sale():
    try:
        data = request.get_json(silent=True)
        if not data:
            return jsonify({
                "success": False,
                "error": "Request body must contain JSON data."
            }), 400

        name = data.get("name")
        phone = data.get("phone")
        location = data.get("location")
        bike_name = data.get("bike_name")

        if not name or not phone or not location:
            return jsonify({
                "success": False,
                "error": "Name, mobile number, and location are required."
            }), 400

        sale_booking_data = {
            "user_id": str(data.get("user_id", "guest")),
            "name": str(name).strip(),
            "phone": str(phone).strip(),
            "location": str(location).strip(),
            "bike_name": str(bike_name or "Custom Sale Bike").strip(),
            "price": str(data.get("price", "N/A")).strip(),
            "date": str(data.get("date", datetime.now(UTC).strftime("%Y-%m-%d"))).strip(),
            "status": "Pending",
            "created_at": datetime.now(UTC),
            "updated_at": datetime.now(UTC)
        }

        result = book_sales_collection.insert_one(sale_booking_data)

        return jsonify({
            "success": True,
            "message": "Booking request submitted successfully! Our sales team will contact you shortly.",
            "booking_id": str(result.inserted_id)
        }), 201

    except Exception as e:
        print("❌ BOOK SALE ERROR:", str(e))
        return jsonify({
            "success": False,
            "error": "Unable to submit booking request.",
            "details": str(e)
        }), 500


# 🚀 Run app
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)




