from flask import Blueprint, request, Response, jsonify, current_app
from .middleware import require_auth
from datetime import datetime, timedelta
from pytimeparse import parse
api_bp = Blueprint("api", __name__)
MAX_SEND_INTERVAL_MS = 43200000
MIN_SEND_INTERVAL_MS = 1000

RANGE_CONFIG = {
    "10 minutes": {"seconds": 10 * 60, "max_points": 60},
    "30 minutes": {"seconds": 30 * 60, "max_points": 90},
    "1 hour": {"seconds": 60 * 60, "max_points": 120},
    "1 day": {"seconds": 24 * 60 * 60, "max_points": 144},
    "1 week": {"seconds": 7 * 24 * 60 * 60, "max_points": 168},
    "1 month": {"seconds": 30 * 24 * 60 * 60, "max_points": 180},
    "3 months": {"seconds": 90 * 24 * 60 * 60, "max_points": 180},
    "1 year": {"seconds": 365 * 24 * 60 * 60, "max_points": 180},
}


def downsample_readings(readings, max_points):
    if len(readings) <= max_points:
        return readings

    sampled = []
    last_index = len(readings) - 1

    for point_index in range(max_points):
        source_index = round(point_index * last_index / max(max_points - 1, 1))
        sampled.append(readings[source_index])

    return sampled



@api_bp.route("/api/auth/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    supabase = current_app.extensions.get("supabase_client")

    try:
        response = supabase.auth.sign_in_with_password({"email": email, "password": password})
    except:
        return jsonify({"message": "Login failed"}), 400


    return jsonify({
        "message": "Login successful",
        "user_id": response.user.id,
        "display_name": response.user.user_metadata.get("display_name", ""),
        "refresh_token": response.session.refresh_token,
        "access_token": response.session.access_token
    }), 200

     
@api_bp.route("/api/auth/signup", methods=["POST"])
def signup():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    display_name = data.get("display_name", "")

    supabase = current_app.extensions.get("supabase_client")
    try:
        response = supabase.auth.sign_up({"email": email, "password": password, "options": {"data": {"display_name": display_name}}})
    except:
        return jsonify({"message": "Signup failed"}), 400
    
    return jsonify({
        "message": "Signup successful",
        "display_name": response.user.user_metadata.get("display_name", "")
    }), 201


# Logout endpoint - since Supabase doesn't have a server-side logout, we just return success and let the client delete tokens
@api_bp.route("/api/auth/logout", methods=["POST"])
def logout():
    data = request.json
    access_token = data.get("access_token")

    supabase = current_app.extensions.get("supabase_client")

    try:
        response = supabase.auth.sign_out()
    except:
        return jsonify({"message": "Logout failed"}), 400
    return jsonify({"message": "Logout successful"}), 200


@api_bp.route("/api/auth/refresh", methods=["POST"])
def refresh():
    data = request.json
    refresh_token = data.get("refresh_token")

    if not refresh_token:
        return jsonify({"message": "Refresh token is required"}), 400

    supabase = current_app.extensions.get("supabase_client")

    try:
        response = supabase.auth.refresh_session(refresh_token)
        return jsonify({
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token,
        }), 200
    except:
        return jsonify({"message": "Session expired. Please log in again."}), 401



@api_bp.route("/api/devices", methods=["GET"])
@require_auth
def get_devices():
    user = request.user
    supabase = current_app.extensions.get("supabase_client")

    try:
        response = supabase.from_("devices").select("*").eq("owner_id", user.id).execute()
        devices = response.data
    except:
        return jsonify({"message": "Failed to fetch devices"}), 400

    return jsonify({"devices": devices}), 200


@api_bp.route("/api/devices/connect", methods=["POST"])
@require_auth
def connect_device():
    user = request.user
    supabase = current_app.extensions.get("supabase_client")

    data = request.json
    device_id = data.get("device_id")
    device_name = data.get("device_name", "Soilix Device")
    if not device_id:
        return jsonify({"message": "Device ID is required"}), 400
    
    try:
        device_res = supabase.from_("devices").select("*").eq("id", device_id).execute()
        #if device doesn't exist, create it and associate with user
    except: 
        return jsonify({"message": "Device not found"}), 404
    try:
        # Check if device exists is it connected to the user
        device = device_res.data[0] 
        if device["owner_id"] is None: 
            response = supabase.table("devices").update({"owner_id": user.id, "device_name": device_name}).eq("id", device_id).execute()
            return jsonify({"message": "Device connected successfully",
                            "name":device_name}), 200
        elif device["owner_id"] == user.id:
            return jsonify({"message": "Device is already connected to you"}), 200
        elif device["owner_id"] != user.id:
            return jsonify({"message": "Device is already connected to another user"}), 400
    except:
        return jsonify({"message": "Failed to connect device"}), 400


@api_bp.route("/api/devices/disconnect", methods=["POST"])
@require_auth
def disconnect_device():
    user = request.user
    supabase = current_app.extensions.get("supabase_client")

    data = request.json
    device_id = data.get("device_id")
    if not device_id:
        return jsonify({"message": "Device ID is required"}), 400
    
    try:
        device_res = supabase.from_("devices").select("*").eq("id", device_id).execute()
        device = device_res.data[0]
        if device["owner_id"] != user.id:
            return jsonify({"message": "Device is not connected to you"}), 400
        response = supabase.table("devices").update({"owner_id": None, "device_name":"Soilix Device"}).eq("id", device_id).execute()
        return jsonify({"message": "Device disconnected successfully"}), 200
    except:
        return jsonify({"message": "Failed to disconnect device"}), 400
    

@api_bp.route("/api/devices/<device_id>", methods=["PATCH"])
@require_auth
def rename(device_id): 
    user = request.user
    supabase = current_app.extensions.get("supabase_client")

    data = request.json
    new_name = data.get("device_name")
    send_interval_ms = data.get("send_interval_ms")

    update_payload = {}
    if isinstance(new_name, str) and new_name.strip():
        update_payload["device_name"] = new_name.strip()

    if send_interval_ms is not None:
        try:
            interval_value = int(send_interval_ms)
        except (TypeError, ValueError):
            return jsonify({"message": "Send interval must be an integer number of milliseconds"}), 400

        if interval_value < MIN_SEND_INTERVAL_MS or interval_value > MAX_SEND_INTERVAL_MS:
            return jsonify({"message": f"Send interval must be between {MIN_SEND_INTERVAL_MS} and {MAX_SEND_INTERVAL_MS} ms"}), 400

        update_payload["send_interval_ms"] = interval_value

    if not update_payload:
        return jsonify({"message": "At least one device setting is required"}), 400

    try:
        device_res = supabase.from_("devices").select("*").eq("id", device_id).execute()
        device = device_res.data[0]
        if device["owner_id"] != user.id:
            return jsonify({"message": "Device is not connected to you"}), 400
        supabase.table("devices").update(update_payload).eq("id", device_id).execute()
        return jsonify({
            "message": "Device updated successfully",
            "name": update_payload.get("device_name", device.get("device_name")),
            "send_interval_ms": update_payload.get("send_interval_ms", device.get("send_interval_ms")),
        }), 200
    except:
        return jsonify({"message": "Failed to update device"}), 400

    
@api_bp.route("/api/devices/live", methods=["GET"])
@require_auth
def last_reading_all_devices_user():
    user = request.user
    supabase = current_app.extensions.get("supabase_client")

    try:
        devices_res = supabase.from_("devices").select("*").eq("owner_id", user.id).execute()
        devices = devices_res.data
        result = []
        for device in devices:
            reading_res = supabase.from_("device_readings").select("*").eq("device_id", device["id"]).order("recorded_at", desc=True).limit(1).execute()
            if reading_res.data:
                last_reading = reading_res.data[0]
                result.append({
                    "device_id": device["id"],
                    "device_name": device["device_name"],
                    "air_temp_c": last_reading["air_temp_c"],
                    "air_humidity_pct": last_reading["air_humidity_pct"],
                    "air_pressure_hpa": last_reading["air_pressure_hpa"],
                    "soil_humidity_pct": last_reading["soil_humidity_pct"],
                    "soil_temp_c": last_reading["soil_temp_c"],
                    "wind_speed_ms": last_reading["wind_speed_ms"],
                    "send_interval_ms": device.get("send_interval_ms"),
                    "recorded_at": last_reading["recorded_at"]
                })
            else:
                result.append({
                    "device_id": device["id"],
                    "device_name": device["device_name"],
                    "air_temp_c": None,
                    "air_humidity_pct": None,
                    "air_pressure_hpa": None,
                    "soil_humidity_pct": None,
                    "soil_temp_c": None,
                    "wind_speed_ms": None,
                    "send_interval_ms": device.get("send_interval_ms"),
                    "recorded_at": None
                })
        
        result.sort(key=lambda x: x["device_name"])
        return jsonify({"devices": result}), 200
    except:
        return jsonify({"message": "Failed to fetch live readings"}), 400


@api_bp.route("/api/devices/<device_id>/live", methods=["GET"]) 
@require_auth
def last_reading_device_user(device_id):
    user = request.user
    supabase = current_app.extensions.get("supabase_client")

    try:
        device_res = supabase.from_("devices").select("*").eq("id", device_id).execute()
        device = device_res.data[0]
        if device["owner_id"] != user.id:
            return jsonify({"message": "Device is not connected to you"}), 400
        reading_res = supabase.from_("device_readings").select("*").eq("device_id", device_id).order("recorded_at", desc=True).limit(1).execute()
        if reading_res.data:
            last_reading = reading_res.data[0]
            result = {
                "device_id": device["id"],
                "device_name": device["device_name"],
                "air_temp_c": last_reading["air_temp_c"],
                "air_humidity_pct": last_reading["air_humidity_pct"],
                "air_pressure_hpa": last_reading["air_pressure_hpa"],
                "soil_humidity_pct": last_reading["soil_humidity_pct"],
                "soil_temp_c": last_reading["soil_temp_c"],
                "wind_speed_ms": last_reading["wind_speed_ms"],
                "send_interval_ms": device.get("send_interval_ms"),
                "recorded_at": last_reading["recorded_at"]
            }
        else:
            result = {
                "device_id": device["id"],
                "device_name": device["device_name"],
                "air_temp_c": None,
                "air_humidity_pct": None,
                "air_pressure_hpa": None,
                "soil_humidity_pct": None,
                "soil_temp_c": None,
                "wind_speed_ms": None,
                "send_interval_ms": device.get("send_interval_ms"),
                "recorded_at": None
            }
        return jsonify(result), 200
    except:
        return jsonify({"message": "Failed to fetch live reading"}), 400


@api_bp.route("/api/devices/<device_id>/history", methods=["GET"])
@require_auth
def device_history(device_id):
    user = request.user
    time_range = request.args.get("range")
    range_config = RANGE_CONFIG.get(time_range)
    seconds = range_config["seconds"] if range_config else parse(time_range)
    if seconds is None:
        return jsonify({"message": "Invalid time range format"}), 400
    start_time = datetime.utcnow() - timedelta(seconds=seconds)
    max_points = range_config["max_points"] if range_config else 180

    supabase = current_app.extensions.get("supabase_client")

    try:
        device_res = supabase.from_("devices").select("*").eq("id", device_id).execute()
        device = device_res.data[0]
        if device["owner_id"] != user.id:
            return jsonify({"message": "Device is not connected to you"}), 400
        readings_res = supabase.from_("device_readings").select("*").eq("device_id", device_id).gte("recorded_at", start_time).order("recorded_at", desc=True).execute()
        readings = downsample_readings(list(reversed(readings_res.data)), max_points)
        return jsonify({"readings": readings}), 200
    except Exception as e:
        error = str(e)
        return jsonify({"message": "Failed to fetch device history"}), 400
