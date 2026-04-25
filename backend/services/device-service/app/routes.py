from flask import Blueprint, Response, request, jsonify, current_app


device_bp = Blueprint("device", __name__)
MAX_SEND_INTERVAL_MS = 43200000

@device_bp.route("/device/reading/<device_id>", methods=["POST"])
def send_reading(device_id):
    data = request.get_data(as_text=True)
    params = data.split(" ")

    if(len(params) != 6):
        return jsonify({"message": "Invalid number of parameters. Expected 6 parameters."}), 400

    for param in params:
        try:
            float(param)
        except ValueError:
            return jsonify({"message": f"Invalid parameter value: {param}. All parameters must be numeric."}), 400

    entry = {"device_id": device_id.strip(), "air_temp_c": float(params[0]), "air_humidity_pct": float(params[1]),
                   "air_pressure_hpa": float(params[2]), "soil_humidity_pct": float(params[3]), "soil_temp_c": float(params[4]),
                   "wind_speed_ms": float(params[5])}
    
    #-127 is a set error code for any sensor that doesn't work
    if(entry["air_temp_c"] == -127 or entry["air_humidity_pct"] == -127 or entry["air_pressure_hpa"] == -127 or entry["soil_humidity_pct"] == -127 or entry["soil_temp_c"] == -127):
        return jsonify({"message": "Faulty sensor. Reading was not stored."}), 502

    supabase = current_app.extensions.get("supabase_client")
    try:
        supabase.table("device_readings").insert(entry).execute()
        device_res = supabase.from_("devices").select("send_interval_ms").eq("id", device_id.strip()).limit(1).execute()
    except Exception as e:
        error = str(e)
        return jsonify({"message": "Failed to insert reading into database.", 
                       "error":error}), 400

    configured_interval = None
    if device_res.data:
        configured_interval = device_res.data[0].get("send_interval_ms")

    if isinstance(configured_interval, (int, float)):
        interval_ms = int(configured_interval)
        if 0 < interval_ms <= MAX_SEND_INTERVAL_MS:
            return Response(str(interval_ms), status=201, mimetype="text/plain")

    return Response("", status=201, mimetype="text/plain")
