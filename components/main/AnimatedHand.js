// AnimatedHand.js
import React, { useRef } from 'react';
import {
  Pressable,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');
const HAND_SIZE = 100;         // your hand PNG dimensions
const BOUNCE_COUNT = 3;        // up+down = 1 bounce
const BOUNCE_DISTANCE = 20;    // how many px up on each bounce
const BOOM_SIZE = 100;         // your boom PNG dimensions
const EDGE_OFFSET = 50;        // how far from screen edges

// Adjusted start positions (closer to middle)
const REST_LEFT_X = EDGE_OFFSET;
const REST_RIGHT_X = width - HAND_SIZE - EDGE_OFFSET;

// Center meet positions, with a small “overlap” so they come closer
const CENTER_X = width / 2;
const GAP = -100;              // negative = overlap by 100px
const halfGap = GAP / 2;
const LEFT_TARGET_X = CENTER_X - HAND_SIZE - halfGap;
const RIGHT_TARGET_X = CENTER_X + halfGap;

export default function AnimatedHand({ onFinish }) {
  const leftX = useRef(new Animated.Value(REST_LEFT_X)).current;
  const rightX = useRef(new Animated.Value(REST_RIGHT_X)).current;
  const bounce = useRef(new Animated.Value(0)).current;
  const clashScale = useRef(new Animated.Value(0)).current;
  const clashOpacity = useRef(new Animated.Value(0)).current;
  const animating = useRef(false);

  const startAnimation = () => {
    if (animating.current) return;
    animating.current = true;

    // 1) Slide in + clash during slide
    Animated.parallel([
      Animated.spring(leftX, {
        toValue: LEFT_TARGET_X,
        useNativeDriver: true,
      }),
      Animated.spring(rightX, {
        toValue: RIGHT_TARGET_X,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(150),
        Animated.parallel([
          Animated.timing(clashOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(clashScale, {
            toValue: 1.4,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(clashScale, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(clashOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start(() => {
      // 2) Bounce up/down BOUNCE_COUNT times
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounce, {
            toValue: -BOUNCE_DISTANCE,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(bounce, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
        ]),
        { iterations: BOUNCE_COUNT }
      ).start(() => {
        // End without sliding back -- leave at center
        animating.current = false;
        if (onFinish) onFinish();
      });
    });
  };

  return (
    <Pressable style={styles.wrapper} onPress={startAnimation}>
      {/* Left hand */}
      <Animated.Image
        source={require('../assets/LeftHand.png')}
        style={[
          styles.hand,
          { tintColor: 'white' },
          {
            transform: [
              { translateX: leftX },
              { translateY: bounce },
              { rotate: '40deg' },
            ],
          },
        ]}
      />

      {/* Right hand (mirrored + opposite tilt) */}
      <Animated.Image
        source={require('../assets/LeftHand.png')}
        style={[
          styles.hand,
          { tintColor: 'white' },
          {
            transform: [
              { translateX: rightX },
              { translateY: bounce },
              { scaleX: -1 },
              { rotate: '40deg' },
            ],
          },
        ]}
      />

      {/* Clash “boom” graphic */}
      <Animated.Image
        source={require('../assets/boom.png')}
        style={[
          styles.boom,
          {
            opacity: clashOpacity,
            transform: [{ scale: clashScale }],
          },
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width,                // full screen width
    height: HAND_SIZE,    // just tall enough for the hands
    overflow: 'hidden',   // clip off-screen bits
  },
  hand: {
    position: 'absolute',
    width: HAND_SIZE,
    height: HAND_SIZE,
    top: 0,               // aligned to top of wrapper
    resizeMode: 'contain',
  },
  boom: {
    position: 'absolute',
    width: BOOM_SIZE,
    height: BOOM_SIZE,
    top: 3,               // adjust as needed
    left: (width - BOOM_SIZE) / 2 + 8,  // center horizontally + 5px
    resizeMode: 'contain',
  },
});