//===== (Imports) ======
import React, { useEffect, useRef, useState } from "react";
import { Text } from "react-native";

//===== (CountUpNumber Component) ======
export default function CountUpNumber({
  value = 0,
  unit = "kW",
  decimals = 1,
  duration = 800,
  style,
  numberOfLines = 1,
}) {
  const numericTarget = typeof value === "number" && !isNaN(value) ? value : 0;
  const [displayValue, setDisplayValue] = useState(0);
  const startValueRef = useRef(0);
  const animFrameRef = useRef(null);

  useEffect(() => {
    const startVal = startValueRef.current;
    const diff = numericTarget - startVal;

    if (diff === 0) {
      setDisplayValue(numericTarget);
      return;
    }

    const startTime = Date.now();

    const updateCounter = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease Out Cubic: 1 - (1 - t)^3
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = startVal + diff * easeProgress;

      setDisplayValue(current);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(updateCounter);
      } else {
        startValueRef.current = numericTarget;
      }
    };

    animFrameRef.current = requestAnimationFrame(updateCounter);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [numericTarget, duration]);

  const formattedNumber =
    decimals > 0
      ? displayValue.toFixed(decimals)
      : Math.round(displayValue).toString();

  return (
    <Text style={style} numberOfLines={numberOfLines}>
      {`${formattedNumber}${unit}`}
    </Text>
  );
}
