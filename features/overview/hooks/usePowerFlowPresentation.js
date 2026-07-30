//===== (Imports) ======
import { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';
import {
  BATTERY_BUBBLE_CONFIG,
  BATTERY_POINTER_CONFIG,
  GRID_POINTER_CONFIG,
  LOAD_POINTER_CONFIG,
  POWER_FLOW_OVERLAY_LAYOUT,
  PV_POINTER_CONFIG,
} from '../constants/overviewConstants';
import { hasActivePowerFlowValue } from '../utils/dateTime';
import {
  getBatteryPointerCoordinates,
  getGridPointerCoordinates,
  getLoadPointerCoordinates,
  getPointerAnimationEasing,
  getPowerFlowOverlayHeight,
  getPowerFlowOverlayScale,
  getPvPointerCoordinates,
  lockPointerEndpoint,
} from '../utils/powerFlow';

//===== (usePowerFlowPresentation) ======
export function usePowerFlowPresentation({ plantData, windowWidth }) {
  const [houseOverlayLayout, setHouseOverlayLayout] = useState(null);
  const [gridBubbleLayout, setGridBubbleLayout] = useState(null);
  const [batteryBubbleLayout, setBatteryBubbleLayout] = useState(null);
  const [pvBubbleLayout, setPvBubbleLayout] = useState(null);
  const [loadBubbleLayout, setLoadBubbleLayout] = useState(null);
  const gridPointerProgress = useRef(new Animated.Value(0)).current;
  const batteryPointerProgress = useRef(new Animated.Value(0)).current;
  const pvPointerProgress = useRef(new Animated.Value(0)).current;
  const loadPointerProgress = useRef(new Animated.Value(0)).current;
  const gridPointerEndRef = useRef(null);
  const pvPointerEndRef = useRef(null);
  const loadPointerEndRef = useRef(null);

  //===== (animateGridPointer) ======
  useEffect(() => {
    const loopDelay = Math.max(
      0,
      GRID_POINTER_CONFIG.animationLoopInterval -
        GRID_POINTER_CONFIG.animationDuration,
    );
    const pointerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(gridPointerProgress, {
          toValue: 1,
          duration: GRID_POINTER_CONFIG.animationDuration,
          easing: getPointerAnimationEasing(GRID_POINTER_CONFIG),
          useNativeDriver: true,
        }),
        Animated.delay(loopDelay),
        Animated.timing(gridPointerProgress, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    gridPointerProgress.setValue(0);
    pointerLoop.start();

    return () => pointerLoop.stop();
  }, [gridPointerProgress]);

  //===== (animateBatteryPointer) ======
  useEffect(() => {
    const loopDelay = Math.max(
      0,
      BATTERY_POINTER_CONFIG.animationLoopInterval -
        BATTERY_POINTER_CONFIG.animationDuration,
    );
    const pointerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(batteryPointerProgress, {
          toValue: 1,
          duration: BATTERY_POINTER_CONFIG.animationDuration,
          easing: getPointerAnimationEasing(BATTERY_POINTER_CONFIG),
          useNativeDriver: true,
        }),
        Animated.delay(loopDelay),
        Animated.timing(batteryPointerProgress, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    batteryPointerProgress.setValue(0);
    pointerLoop.start();

    return () => pointerLoop.stop();
  }, [batteryPointerProgress]);

  //===== (animatePvPointer) ======
  useEffect(() => {
    const loopDelay = Math.max(
      0,
      PV_POINTER_CONFIG.animationLoopInterval -
        PV_POINTER_CONFIG.animationDuration,
    );
    const pointerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pvPointerProgress, {
          toValue: 1,
          duration: PV_POINTER_CONFIG.animationDuration,
          easing: getPointerAnimationEasing(PV_POINTER_CONFIG),
          useNativeDriver: true,
        }),
        Animated.delay(loopDelay),
        Animated.timing(pvPointerProgress, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    pvPointerProgress.setValue(0);
    pointerLoop.start();

    return () => pointerLoop.stop();
  }, [pvPointerProgress]);

  //===== (animateLoadPointer) ======
  useEffect(() => {
    const loopDelay = Math.max(
      0,
      LOAD_POINTER_CONFIG.animationLoopInterval -
        LOAD_POINTER_CONFIG.animationDuration,
    );
    const pointerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(loadPointerProgress, {
          toValue: 1,
          duration: LOAD_POINTER_CONFIG.animationDuration,
          easing: getPointerAnimationEasing(LOAD_POINTER_CONFIG),
          useNativeDriver: true,
        }),
        Animated.delay(loopDelay),
        Animated.timing(loadPointerProgress, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    loadPointerProgress.setValue(0);
    pointerLoop.start();

    return () => pointerLoop.stop();
  }, [loadPointerProgress]);

  const fallbackHouseOverlayWidth = Math.max(0, windowWidth - 32);
  const houseOverlayWidth =
    houseOverlayLayout?.width || fallbackHouseOverlayWidth;
  const houseOverlayHeight = getPowerFlowOverlayHeight(houseOverlayWidth);
  const bubbleScale = getPowerFlowOverlayScale(
    houseOverlayWidth,
    houseOverlayHeight,
  );
  const responsiveBubbleStyle = {
    width: POWER_FLOW_OVERLAY_LAYOUT.bubbleWidth * bubbleScale,
    height: POWER_FLOW_OVERLAY_LAYOUT.bubbleHeight * bubbleScale,
    paddingHorizontal:
      POWER_FLOW_OVERLAY_LAYOUT.bubblePaddingHorizontal * bubbleScale,
    paddingVertical:
      POWER_FLOW_OVERLAY_LAYOUT.bubblePaddingVertical * bubbleScale,
    borderRadius: POWER_FLOW_OVERLAY_LAYOUT.bubbleBorderRadius * bubbleScale,
  };
  const responsiveBubbleLabelStyle = {
    fontSize: POWER_FLOW_OVERLAY_LAYOUT.bubbleLabelFontSize * bubbleScale,
  };
  const responsiveBubbleValueStyle = {
    fontSize: POWER_FLOW_OVERLAY_LAYOUT.bubbleValueFontSize * bubbleScale,
  };
  const responsiveBatteryLabelStyle = {
    fontSize: BATTERY_BUBBLE_CONFIG.titleFontSize * bubbleScale,
  };
  const responsiveBatteryValueStyle = {
    fontSize: BATTERY_BUBBLE_CONFIG.valueFontSize * bubbleScale,
  };
  const gridPointerCoordinates = lockPointerEndpoint(
    getGridPointerCoordinates(
      houseOverlayLayout,
      gridBubbleLayout,
      bubbleScale,
    ),
    gridPointerEndRef,
  );
  const batteryPointerCoordinates = getBatteryPointerCoordinates(
    houseOverlayLayout,
    batteryBubbleLayout,
    bubbleScale,
  );
  const pvPointerCoordinates = lockPointerEndpoint(
    getPvPointerCoordinates(houseOverlayLayout, pvBubbleLayout, bubbleScale),
    pvPointerEndRef,
  );
  const loadPointerCoordinates = lockPointerEndpoint(
    getLoadPointerCoordinates(
      houseOverlayLayout,
      loadBubbleLayout,
      bubbleScale,
    ),
    loadPointerEndRef,
  );
  const shouldAnimateGridPointer =
    plantData.isDeviceOnline && hasActivePowerFlowValue(plantData.grid);
  const shouldAnimateBatteryPointer =
    plantData.isDeviceOnline && hasActivePowerFlowValue(plantData.battery);
  const shouldAnimatePvPointer =
    plantData.isDeviceOnline && hasActivePowerFlowValue(plantData.production);
  const shouldAnimateLoadPointer =
    plantData.isDeviceOnline && hasActivePowerFlowValue(plantData.load);
  const isBatteryPointerReverse = Number(plantData.battery) < 0;
  const gridPointerDotSize = GRID_POINTER_CONFIG.dotSize * bubbleScale;
  const gridPointerGlowSize = GRID_POINTER_CONFIG.dotSize * 2.8 * bubbleScale;
  const batteryPointerDotSize = BATTERY_POINTER_CONFIG.dotSize * bubbleScale;
  const batteryPointerGlowSize =
    BATTERY_POINTER_CONFIG.dotSize * 2.8 * bubbleScale;
  const pvPointerDotSize = PV_POINTER_CONFIG.dotSize * bubbleScale;
  const pvPointerGlowSize = PV_POINTER_CONFIG.dotSize * 2.8 * bubbleScale;
  const loadPointerDotSize = LOAD_POINTER_CONFIG.dotSize * bubbleScale;
  const loadPointerGlowSize = LOAD_POINTER_CONFIG.dotSize * 2.8 * bubbleScale;
  const gridPointerDotX = gridPointerCoordinates
    ? gridPointerProgress.interpolate({
        inputRange: [
          0,
          gridPointerCoordinates.leadProgress,
          gridPointerCoordinates.bendProgress,
          1,
        ],
        outputRange: [
          gridPointerCoordinates.startX - gridPointerDotSize / 2,
          gridPointerCoordinates.leadX - gridPointerDotSize / 2,
          gridPointerCoordinates.bendX - gridPointerDotSize / 2,
          gridPointerCoordinates.endX - gridPointerDotSize / 2,
        ],
      })
    : null;
  const gridPointerDotY = gridPointerCoordinates
    ? gridPointerProgress.interpolate({
        inputRange: [
          0,
          gridPointerCoordinates.leadProgress,
          gridPointerCoordinates.bendProgress,
          1,
        ],
        outputRange: [
          gridPointerCoordinates.startY - gridPointerDotSize / 2,
          gridPointerCoordinates.leadY - gridPointerDotSize / 2,
          gridPointerCoordinates.bendY - gridPointerDotSize / 2,
          gridPointerCoordinates.endY - gridPointerDotSize / 2,
        ],
      })
    : null;
  const gridPointerGlowX = gridPointerCoordinates
    ? gridPointerProgress.interpolate({
        inputRange: [
          0,
          gridPointerCoordinates.leadProgress,
          gridPointerCoordinates.bendProgress,
          1,
        ],
        outputRange: [
          gridPointerCoordinates.startX - gridPointerGlowSize / 2,
          gridPointerCoordinates.leadX - gridPointerGlowSize / 2,
          gridPointerCoordinates.bendX - gridPointerGlowSize / 2,
          gridPointerCoordinates.endX - gridPointerGlowSize / 2,
        ],
      })
    : null;
  const gridPointerGlowY = gridPointerCoordinates
    ? gridPointerProgress.interpolate({
        inputRange: [
          0,
          gridPointerCoordinates.leadProgress,
          gridPointerCoordinates.bendProgress,
          1,
        ],
        outputRange: [
          gridPointerCoordinates.startY - gridPointerGlowSize / 2,
          gridPointerCoordinates.leadY - gridPointerGlowSize / 2,
          gridPointerCoordinates.bendY - gridPointerGlowSize / 2,
          gridPointerCoordinates.endY - gridPointerGlowSize / 2,
        ],
      })
    : null;
  const batteryPointerDotX = batteryPointerCoordinates
    ? batteryPointerProgress.interpolate({
        inputRange: [0, batteryPointerCoordinates.bendProgress, 1],
        outputRange: isBatteryPointerReverse
          ? [
              batteryPointerCoordinates.endX - batteryPointerDotSize / 2,
              batteryPointerCoordinates.bendX - batteryPointerDotSize / 2,
              batteryPointerCoordinates.startX - batteryPointerDotSize / 2,
            ]
          : [
              batteryPointerCoordinates.startX - batteryPointerDotSize / 2,
              batteryPointerCoordinates.bendX - batteryPointerDotSize / 2,
              batteryPointerCoordinates.endX - batteryPointerDotSize / 2,
            ],
      })
    : null;
  const batteryPointerDotY = batteryPointerCoordinates
    ? batteryPointerProgress.interpolate({
        inputRange: [0, batteryPointerCoordinates.bendProgress, 1],
        outputRange: isBatteryPointerReverse
          ? [
              batteryPointerCoordinates.endY - batteryPointerDotSize / 2,
              batteryPointerCoordinates.bendY - batteryPointerDotSize / 2,
              batteryPointerCoordinates.startY - batteryPointerDotSize / 2,
            ]
          : [
              batteryPointerCoordinates.startY - batteryPointerDotSize / 2,
              batteryPointerCoordinates.bendY - batteryPointerDotSize / 2,
              batteryPointerCoordinates.endY - batteryPointerDotSize / 2,
            ],
      })
    : null;
  const batteryPointerGlowX = batteryPointerCoordinates
    ? batteryPointerProgress.interpolate({
        inputRange: [0, batteryPointerCoordinates.bendProgress, 1],
        outputRange: isBatteryPointerReverse
          ? [
              batteryPointerCoordinates.endX - batteryPointerGlowSize / 2,
              batteryPointerCoordinates.bendX - batteryPointerGlowSize / 2,
              batteryPointerCoordinates.startX - batteryPointerGlowSize / 2,
            ]
          : [
              batteryPointerCoordinates.startX - batteryPointerGlowSize / 2,
              batteryPointerCoordinates.bendX - batteryPointerGlowSize / 2,
              batteryPointerCoordinates.endX - batteryPointerGlowSize / 2,
            ],
      })
    : null;
  const batteryPointerGlowY = batteryPointerCoordinates
    ? batteryPointerProgress.interpolate({
        inputRange: [0, batteryPointerCoordinates.bendProgress, 1],
        outputRange: isBatteryPointerReverse
          ? [
              batteryPointerCoordinates.endY - batteryPointerGlowSize / 2,
              batteryPointerCoordinates.bendY - batteryPointerGlowSize / 2,
              batteryPointerCoordinates.startY - batteryPointerGlowSize / 2,
            ]
          : [
              batteryPointerCoordinates.startY - batteryPointerGlowSize / 2,
              batteryPointerCoordinates.bendY - batteryPointerGlowSize / 2,
              batteryPointerCoordinates.endY - batteryPointerGlowSize / 2,
            ],
      })
    : null;
  const pvPointerDotX = pvPointerCoordinates
    ? pvPointerProgress.interpolate({
        inputRange: [0, pvPointerCoordinates.bendProgress, 1],
        outputRange: [
          pvPointerCoordinates.startX - pvPointerDotSize / 2,
          pvPointerCoordinates.bendX - pvPointerDotSize / 2,
          pvPointerCoordinates.endX - pvPointerDotSize / 2,
        ],
      })
    : null;
  const pvPointerDotY = pvPointerCoordinates
    ? pvPointerProgress.interpolate({
        inputRange: [0, pvPointerCoordinates.bendProgress, 1],
        outputRange: [
          pvPointerCoordinates.startY - pvPointerDotSize / 2,
          pvPointerCoordinates.bendY - pvPointerDotSize / 2,
          pvPointerCoordinates.endY - pvPointerDotSize / 2,
        ],
      })
    : null;
  const pvPointerGlowX = pvPointerCoordinates
    ? pvPointerProgress.interpolate({
        inputRange: [0, pvPointerCoordinates.bendProgress, 1],
        outputRange: [
          pvPointerCoordinates.startX - pvPointerGlowSize / 2,
          pvPointerCoordinates.bendX - pvPointerGlowSize / 2,
          pvPointerCoordinates.endX - pvPointerGlowSize / 2,
        ],
      })
    : null;
  const pvPointerGlowY = pvPointerCoordinates
    ? pvPointerProgress.interpolate({
        inputRange: [0, pvPointerCoordinates.bendProgress, 1],
        outputRange: [
          pvPointerCoordinates.startY - pvPointerGlowSize / 2,
          pvPointerCoordinates.bendY - pvPointerGlowSize / 2,
          pvPointerCoordinates.endY - pvPointerGlowSize / 2,
        ],
      })
    : null;
  const loadPointerDotX = loadPointerCoordinates
    ? loadPointerProgress.interpolate({
        inputRange: [0, loadPointerCoordinates.bendProgress, 1],
        outputRange: [
          loadPointerCoordinates.endX - loadPointerDotSize / 2,
          loadPointerCoordinates.bendX - loadPointerDotSize / 2,
          loadPointerCoordinates.startX - loadPointerDotSize / 2,
        ],
      })
    : null;
  const loadPointerDotY = loadPointerCoordinates
    ? loadPointerProgress.interpolate({
        inputRange: [0, loadPointerCoordinates.bendProgress, 1],
        outputRange: [
          loadPointerCoordinates.endY - loadPointerDotSize / 2,
          loadPointerCoordinates.bendY - loadPointerDotSize / 2,
          loadPointerCoordinates.startY - loadPointerDotSize / 2,
        ],
      })
    : null;
  const loadPointerGlowX = loadPointerCoordinates
    ? loadPointerProgress.interpolate({
        inputRange: [0, loadPointerCoordinates.bendProgress, 1],
        outputRange: [
          loadPointerCoordinates.endX - loadPointerGlowSize / 2,
          loadPointerCoordinates.bendX - loadPointerGlowSize / 2,
          loadPointerCoordinates.startX - loadPointerGlowSize / 2,
        ],
      })
    : null;
  const loadPointerGlowY = loadPointerCoordinates
    ? loadPointerProgress.interpolate({
        inputRange: [0, loadPointerCoordinates.bendProgress, 1],
        outputRange: [
          loadPointerCoordinates.endY - loadPointerGlowSize / 2,
          loadPointerCoordinates.bendY - loadPointerGlowSize / 2,
          loadPointerCoordinates.startY - loadPointerGlowSize / 2,
        ],
      })
    : null;
  const gridPointerDotOpacity =
    GRID_POINTER_CONFIG.animationEffect === "fade"
      ? gridPointerProgress.interpolate({
          inputRange: [0, 0.15, 0.85, 1],
          outputRange: [
            0,
            GRID_POINTER_CONFIG.dotOpacity,
            GRID_POINTER_CONFIG.dotOpacity,
            0,
          ],
        })
      : GRID_POINTER_CONFIG.dotOpacity;
  const gridPointerGlowScale =
    GRID_POINTER_CONFIG.enablePulse ||
    GRID_POINTER_CONFIG.animationEffect === "pulse"
      ? gridPointerProgress.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.9, 1.18, 0.9],
        })
      : 1;
  const batteryPointerDotOpacity =
    BATTERY_POINTER_CONFIG.animationEffect === "fade"
      ? batteryPointerProgress.interpolate({
          inputRange: [0, 0.15, 0.85, 1],
          outputRange: [
            0,
            BATTERY_POINTER_CONFIG.dotOpacity,
            BATTERY_POINTER_CONFIG.dotOpacity,
            0,
          ],
        })
      : BATTERY_POINTER_CONFIG.dotOpacity;
  const batteryPointerGlowScale =
    BATTERY_POINTER_CONFIG.enablePulse ||
    BATTERY_POINTER_CONFIG.animationEffect === "pulse"
      ? batteryPointerProgress.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.9, 1.18, 0.9],
        })
      : 1;
  const pvPointerDotOpacity =
    PV_POINTER_CONFIG.animationEffect === "fade"
      ? pvPointerProgress.interpolate({
          inputRange: [0, 0.15, 0.85, 1],
          outputRange: [
            0,
            PV_POINTER_CONFIG.dotOpacity,
            PV_POINTER_CONFIG.dotOpacity,
            0,
          ],
        })
      : PV_POINTER_CONFIG.dotOpacity;
  const pvPointerGlowScale =
    PV_POINTER_CONFIG.enablePulse ||
    PV_POINTER_CONFIG.animationEffect === "pulse"
      ? pvPointerProgress.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.9, 1.18, 0.9],
        })
      : 1;
  const loadPointerDotOpacity =
    LOAD_POINTER_CONFIG.animationEffect === "fade"
      ? loadPointerProgress.interpolate({
          inputRange: [0, 0.15, 0.85, 1],
          outputRange: [
            0,
            LOAD_POINTER_CONFIG.dotOpacity,
            LOAD_POINTER_CONFIG.dotOpacity,
            0,
          ],
        })
      : LOAD_POINTER_CONFIG.dotOpacity;
  const loadPointerGlowScale =
    LOAD_POINTER_CONFIG.enablePulse ||
    LOAD_POINTER_CONFIG.animationEffect === "pulse"
      ? loadPointerProgress.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.9, 1.18, 0.9],
        })
      : 1;

  return {
    batteryPointerCoordinates,
    batteryPointerDotOpacity,
    batteryPointerDotSize,
    batteryPointerDotX,
    batteryPointerDotY,
    batteryPointerGlowScale,
    batteryPointerGlowSize,
    batteryPointerGlowX,
    batteryPointerGlowY,
    bubbleScale,
    gridPointerCoordinates,
    gridPointerDotOpacity,
    gridPointerDotSize,
    gridPointerDotX,
    gridPointerDotY,
    gridPointerGlowScale,
    gridPointerGlowSize,
    gridPointerGlowX,
    gridPointerGlowY,
    houseOverlayHeight,
    houseOverlayWidth,
    loadPointerCoordinates,
    loadPointerDotOpacity,
    loadPointerDotSize,
    loadPointerDotX,
    loadPointerDotY,
    loadPointerGlowScale,
    loadPointerGlowSize,
    loadPointerGlowX,
    loadPointerGlowY,
    pvPointerCoordinates,
    pvPointerDotOpacity,
    pvPointerDotSize,
    pvPointerDotX,
    pvPointerDotY,
    pvPointerGlowScale,
    pvPointerGlowSize,
    pvPointerGlowX,
    pvPointerGlowY,
    responsiveBatteryLabelStyle,
    responsiveBatteryValueStyle,
    responsiveBubbleLabelStyle,
    responsiveBubbleStyle,
    responsiveBubbleValueStyle,
    setBatteryBubbleLayout,
    setGridBubbleLayout,
    setHouseOverlayLayout,
    setLoadBubbleLayout,
    setPvBubbleLayout,
    shouldAnimateBatteryPointer,
    shouldAnimateGridPointer,
    shouldAnimateLoadPointer,
    shouldAnimatePvPointer,
  };
}
