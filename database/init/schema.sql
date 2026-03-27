CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
);

CREATE TABLE devices (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    serial_number VARCHAR(100) NOT NULL UNIQUE,
    device_name VARCHAR(100) NOT NULL
);

CREATE TABLE readings (
    id BIGSERIAL PRIMARY KEY,
    device_id BIGINT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    recorded_at TIMESTAMPTZ NOT NULL,
    air_temperature_c DOUBLE PRECISION,
    air_pressure_hpa DOUBLE PRECISION,
    air_humidity_pct DOUBLE PRECISION,
    soil_humidity_pct DOUBLE PRECISION,
    soil_temperature_c DOUBLE PRECISION
);

CREATE INDEX idx_readings_device_recorded_at_desc
ON readings (device_id, recorded_at DESC);
