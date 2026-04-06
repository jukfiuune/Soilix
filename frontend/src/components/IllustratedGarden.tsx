import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle, Ellipse, Path, Rect } from "react-native-svg";
import { SensorReading } from "../context/DeviceContext";

type Props = {
  readings: SensorReading;
};

export function IllustratedGarden({ readings }: Props) {
  const isCold = readings.airTemp < 10;
  const isRainy = readings.airHumidity > 70;
  const isDry = readings.soilHumidity < 35;
  const healthy = !isCold && !isDry && readings.soilHumidity > 50;

  const skyTop = isCold ? "#cbd5e1" : isRainy ? "#94a3b8" : "#9fdefb";
  const skyBottom = isCold ? "#e2e8f0" : isRainy ? "#cbd5e1" : "#d9f3ff";
  const groundTop = isDry ? "#ebc98d" : isCold ? "#cfd8df" : "#b7e3a2";
  const groundBottom = isDry ? "#cfaa67" : isCold ? "#aebbc7" : "#7fc76b";

  return (
    <View style={styles.card}>
      <Svg width="100%" height="240" viewBox="0 0 360 240">
        <Rect x="0" y="0" width="360" height="240" fill={skyBottom} />
        <Rect x="0" y="0" width="360" height="120" fill={skyTop} opacity="0.9" />

        {!isRainy && !isCold ? (
          <>
            <Circle cx="295" cy="48" r="24" fill="#ffd34d" />
            <Circle cx="295" cy="48" r="36" fill="#ffe892" opacity="0.35" />
          </>
        ) : null}

        {(isRainy || isCold) ? (
          <>
            <Cloud x={54} y={40} dark={isRainy} />
            <Cloud x={225} y={58} dark={isRainy} />
          </>
        ) : null}

        {isRainy
          ? Array.from({ length: 18 }, (_, index) => (
              <Path
                key={`rain-${index}`}
                d={`M ${20 + index * 18} ${86 + (index % 3) * 6} l -3 16`}
                stroke="#4f9ad9"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.75"
              />
            ))
          : null}

        {isCold
          ? Array.from({ length: 14 }, (_, index) => (
              <Circle
                key={`snow-${index}`}
                cx={28 + index * 22}
                cy={85 + (index % 4) * 14}
                r="3"
                fill="#ffffff"
                opacity="0.95"
              />
            ))
          : null}

        <Rect x="0" y="145" width="360" height="95" fill={groundTop} />
        <Rect x="0" y="175" width="360" height="65" fill={groundBottom} />

        <Plant x={56} height={38} healthy={healthy} />
        <Plant x={118} height={54} healthy={healthy} />
        <Plant x={180} height={74} healthy={healthy} />
        <Plant x={242} height={54} healthy={healthy} />
        <Plant x={304} height={38} healthy={healthy} />
      </Svg>
    </View>
  );
}

function Cloud({ x, y, dark }: { x: number; y: number; dark: boolean }) {
  const color = dark ? "#66758a" : "#ffffff";

  return (
    <>
      <Ellipse cx={x} cy={y} rx="26" ry="15" fill={color} opacity="0.95" />
      <Ellipse cx={x + 18} cy={y - 6} rx="18" ry="13" fill={color} opacity="0.95" />
      <Ellipse cx={x - 18} cy={y - 4} rx="16" ry="12" fill={color} opacity="0.95" />
    </>
  );
}

function Plant({ x, height, healthy }: { x: number; height: number; healthy: boolean }) {
  const stem = healthy ? "#2f8f46" : "#8b5e34";
  const leaf = healthy ? "#5ebd57" : "#c28c45";

  return (
    <>
      <Rect x={x - 2} y={175 - height} width="4" height={height} rx="2" fill={stem} />
      <Ellipse cx={x - 8} cy={175 - height + 16} rx="10" ry="5" fill={leaf} transform={`rotate(-28 ${x - 8} ${175 - height + 16})`} />
      <Ellipse cx={x + 8} cy={175 - height + 28} rx="10" ry="5" fill={leaf} transform={`rotate(28 ${x + 8} ${175 - height + 28})`} />
      <Ellipse cx={x - 7} cy={175 - height + 40} rx="10" ry="5" fill={leaf} transform={`rotate(-24 ${x - 7} ${175 - height + 40})`} />
      {healthy && height > 45 ? <Circle cx={x} cy={175 - height - 4} r="6" fill="#ffd54d" /> : null}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    overflow: "hidden",
  },
});
