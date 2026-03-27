import React, { createContext, useContext, useEffect, useState } from "react";
import { apiRequest, getBearerAuthHeaders } from "../config/api";
import { useAuth } from "./AuthContext";

export type SensorReading = {
  airTemp: number;
  airHumidity: number;
  airPressure: number;
  soilHumidity: number;
  soilTemp: number;
};

export type Device = {
  id: string;
  name: string;
  readings: SensorReading;
};

export type HistoricalData = {
  timestamp: string;
  value: number;
};

type Metric = keyof SensorReading;
type TimeRange = "1h" | "1d" | "1w" | "1m";

type DeviceContextType = {
  devices: Device[];
  loading: boolean;
  error: string;
  refreshDevices: () => Promise<void>;
  addDevice: (name: string) => void;
  removeDevice: (id: string) => void;
  getDevice: (id: string) => Device | undefined;
  getHistoricalData: (deviceId: string, metric: Metric, timeRange: TimeRange) => HistoricalData[];
};

type BackendDevice = {
  id: string | number;
  device_name?: string | null;
};

type DevicesResponse = {
  devices: BackendDevice[];
};

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

function generateMockReading(): SensorReading {
  return {
    airTemp: Math.round((15 + Math.random() * 15) * 10) / 10,
    airHumidity: Math.round((40 + Math.random() * 40) * 10) / 10,
    airPressure: Math.round((990 + Math.random() * 30) * 10) / 10,
    soilHumidity: Math.round((30 + Math.random() * 50) * 10) / 10,
    soilTemp: Math.round((10 + Math.random() * 15) * 10) / 10,
  };
}

function generateHistoricalData(baseValue: number, points: number, stepMinutes: number) {
  const now = Date.now();

  return Array.from({ length: points }, (_, index) => {
    const time = new Date(now - (points - index - 1) * stepMinutes * 60_000);
    const jitter = (Math.random() - 0.5) * Math.max(baseValue * 0.12, 4);

    return {
      timestamp: time.toISOString(),
      value: Math.round((baseValue + jitter) * 10) / 10,
    };
  });
}

export function DeviceProvider({ children }: React.PropsWithChildren) {
  const { user } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refreshDevices = async () => {
    if (!user?.accessToken) {
      setDevices([]);
      setError("");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await apiRequest<DevicesResponse>("/api/devices", {
        headers: getBearerAuthHeaders(user.accessToken),
      });

      setDevices(
        response.devices.map((device) => ({
          id: String(device.id),
          name: device.device_name?.trim() || `Soilix Device ${device.id}`,
          readings: generateMockReading(),
        })),
      );
    } catch (err) {
      setDevices([]);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshDevices();
  }, [user?.accessToken]);

  const addDevice = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }

    setDevices((current) => [
      ...current,
      { id: String(Date.now()), name: trimmed, readings: generateMockReading() },
    ]);
  };

  const removeDevice = (id: string) => {
    setDevices((current) => current.filter((device) => device.id !== id));
  };

  const getDevice = (id: string) => devices.find((device) => device.id === id);

  const getHistoricalData = (deviceId: string, metric: Metric, timeRange: TimeRange) => {
    const device = getDevice(deviceId);
    if (!device) {
      return [];
    }

    const baseValue = device.readings[metric];
    const rangeMap: Record<TimeRange, { points: number; stepMinutes: number }> = {
      "1h": { points: 12, stepMinutes: 5 },
      "1d": { points: 24, stepMinutes: 60 },
      "1w": { points: 28, stepMinutes: 6 * 60 },
      "1m": { points: 30, stepMinutes: 24 * 60 },
    };

    return generateHistoricalData(baseValue, rangeMap[timeRange].points, rangeMap[timeRange].stepMinutes);
  };

  return (
    <DeviceContext.Provider
      value={{ devices, loading, error, refreshDevices, addDevice, removeDevice, getDevice, getHistoricalData }}
    >
      {children}
    </DeviceContext.Provider>
  );
}

export function useDevices() {
  const context = useContext(DeviceContext);

  if (!context) {
    throw new Error("useDevices must be used within DeviceProvider");
  }

  return context;
}
