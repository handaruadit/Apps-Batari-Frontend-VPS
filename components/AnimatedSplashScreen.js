//===== (Imports) ======
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
} from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

//===== (AnimatedSplashScreen Component - Final: Ide A (Breathing Float & Clean Outro)) ======
export default function AnimatedSplashScreen({ isReady = false, onFinish }) {
  const [visible, setVisible] = useState(true);

  // 1. Entrance values (In Animation)
  const [cardScale] = useState(() => new Animated.Value(0.78));
  const [cardOpacity] = useState(() => new Animated.Value(0));
  const [logoRotation] = useState(() => new Animated.Value(0)); // 0 -> 1 (-18deg -> 0deg)

  const [textOpacity] = useState(() => new Animated.Value(0));
  const [textTranslateY] = useState(() => new Animated.Value(14));

  // 2. Idle / Breathing Float value
  const [floatTranslateY] = useState(() => new Animated.Value(0));
  const floatLoopRef = useRef(null);

  // 3. Exit Outro values (Out Animation)
  const [exitTranslateY] = useState(() => new Animated.Value(0));
  const [screenOpacity] = useState(() => new Animated.Value(1));

  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const exitTriggeredRef = useRef(false);

  // Hide native splash once this component is mounted
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});

    // Minimum display time so the 1 smooth slow rotation (~1.2s) completes and settles nicely
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 1600);

    return () => clearTimeout(timer);
  }, []);

  // 1. Play Entrance (In) Animation
  useEffect(() => {
    const fluidEasing = Easing.bezier(0.16, 1, 0.3, 1);
    const slowSpinEasing = Easing.bezier(0.22, 1, 0.36, 1);

    Animated.parallel([
      // Squircle Card & Emblem Bloom
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 550,
        easing: fluidEasing,
        useNativeDriver: true,
      }),
      Animated.timing(cardScale, {
        toValue: 1,
        duration: 750,
        easing: fluidEasing,
        useNativeDriver: true,
      }),
      // Emblem precision rotation: exactly 1 single rotation (0deg -> 360deg), smooth and slow
      Animated.timing(logoRotation, {
        toValue: 1,
        duration: 1200,
        easing: slowSpinEasing,
        useNativeDriver: true,
      }),

      // "BySense" Typography Reveal
      Animated.sequence([
        Animated.delay(200),
        Animated.parallel([
          Animated.timing(textOpacity, {
            toValue: 1,
            duration: 520,
            easing: fluidEasing,
            useNativeDriver: true,
          }),
          Animated.timing(textTranslateY, {
            toValue: 0,
            duration: 520,
            easing: fluidEasing,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start(() => {
      // 2. Start subtle Breathing Float loop once entrance settles
      if (!exitTriggeredRef.current) {
        floatLoopRef.current = Animated.loop(
          Animated.sequence([
            Animated.timing(floatTranslateY, {
              toValue: -5,
              duration: 1100,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(floatTranslateY, {
              toValue: 0,
              duration: 1100,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        );
        floatLoopRef.current.start();
      }
    });

    return () => {
      if (floatLoopRef.current) {
        floatLoopRef.current.stop();
      }
    };
  }, [cardOpacity, cardScale, logoRotation, textOpacity, textTranslateY, floatTranslateY]);

  // 3. Play Exit (Out) Animation (Clean Dissolve without Shadow Ghosting)
  useEffect(() => {
    if (minTimeElapsed && isReady && !exitTriggeredRef.current) {
      exitTriggeredRef.current = true;

      // Stop idle breathing loop
      if (floatLoopRef.current) {
        floatLoopRef.current.stop();
      }

      const exitEasing = Easing.out(Easing.cubic);

      Animated.parallel([
        // Subtle micro drift upward (only -14px, zero shadow smear)
        Animated.timing(exitTranslateY, {
          toValue: -14,
          duration: 320,
          easing: exitEasing,
          useNativeDriver: true,
        }),
        // Dissolve card & its shadow cleanly
        Animated.timing(cardOpacity, {
          toValue: 0,
          duration: 270,
          easing: exitEasing,
          useNativeDriver: true,
        }),
        // Dissolve text cleanly
        Animated.timing(textOpacity, {
          toValue: 0,
          duration: 270,
          easing: exitEasing,
          useNativeDriver: true,
        }),
        // Dissolve background canvas in exact sync
        Animated.timing(screenOpacity, {
          toValue: 0,
          duration: 320,
          easing: exitEasing,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setVisible(false);
        if (typeof onFinish === 'function') {
          onFinish();
        }
      });
    }
  }, [minTimeElapsed, isReady, exitTranslateY, cardOpacity, textOpacity, screenOpacity, onFinish]);

  if (!visible) {
    return null;
  }

  // Interpolate rotation: 1 single smooth slow rotation (0deg -> 360deg)
  const spin = logoRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent />

      <Animated.View
        pointerEvents="none"
        style={[
          styles.container,
          {
            opacity: screenOpacity,
          },
        ]}
      >
        {/* Outro Exit Container (Subtle Slide-up) */}
        <Animated.View
          style={[
            styles.centerBox,
            {
              transform: [
                { translateY: exitTranslateY },
              ],
            },
          ]}
        >
          {/* Idle Breathing Float Container (Sine-wave hover) */}
          <Animated.View
            style={[
              styles.floatBox,
              {
                transform: [{ translateY: floatTranslateY }],
              },
            ]}
          >
            {/* Rounded Squircle Card with Entrance Scale & Opacity */}
            <Animated.View
              style={[
                styles.squircleCard,
                {
                  opacity: cardOpacity,
                  transform: [{ scale: cardScale }],
                },
              ]}
            >
              {/* Batari Mandala Emblem with Precision Rotation */}
              <Animated.Image
                source={require('@/assets/images/splash-logo-512.png')}
                style={[
                  styles.logoImage,
                  {
                    transform: [{ rotate: spin }],
                  },
                ]}
                resizeMode="contain"
              />
            </Animated.View>

            {/* Clean "BySense" Heading with Entrance Glide */}
            <Animated.View
              style={[
                styles.textContainer,
                {
                  opacity: textOpacity,
                  transform: [{ translateY: textTranslateY }],
                },
              ]}
            >
              <Text style={styles.brandTitle}>BySense</Text>
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

//===== (Styles) ======
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -30,
  },
  floatBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  squircleCard: {
    width: 195,
    height: 195,
    borderRadius: 44,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
      },
      android: {
        elevation: 6,
      },
      default: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
      },
    }),
  },
  logoImage: {
    width: 166,
    height: 166,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.5,
    fontFamily: Platform.select({
      android: 'sans-serif-medium',
      ios: 'System',
      default: 'System',
    }),
  },
});
