import React, { useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';

export default function AnimatedHand({ onFinish }) {
  const animationRef = useRef(null);
  const [hasPlayed, setHasPlayed] = useState(false);

  const handleRightSidePress = () => {
    if (!hasPlayed) {
      animationRef.current?.play();
      setHasPlayed(true);
    }
  };

  const handleAnimationFinish = () => {
    console.log('Animation done');
    if (onFinish && typeof onFinish === 'function') {
      onFinish(); // Trigger the passed navigation or action
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.lottieWrapper}>
        <LottieView
          ref={animationRef}
          source={require('../All_Green.json')}
          loop={false}
          speed={1}
          progress={0}
          style={styles.lottie}
          onAnimationFinish={handleAnimationFinish}
        />
        <TouchableOpacity
          style={styles.rightHalfTouch}
          onPress={handleRightSidePress}
          activeOpacity={0.8}
        />
      </View>
    </View>
  );
}

const { width } = Dimensions.get('window');
const lottieSize = width * 1.5;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottieWrapper: {
    width: lottieSize,
    height: lottieSize,
    position: 'relative',
  },
  lottie: {
    width: lottieSize,
    height: lottieSize,
  },
  rightHalfTouch: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: lottieSize / 2,
    height: lottieSize,
    backgroundColor: 'transparent',
  },
});
