import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

export type CompanionState = 'idle' | 'curious' | 'happy' | 'gentle-concern' | 'sleepy' | 'plant-thirsty';

interface Props {
  state: CompanionState;
}

const CompanionFace: React.FC<Props> = ({ state }) => {
  // In React Native, local images must be explicitly required
  let emotionSource = require('../assets/emotions/blank.gif');
  
  switch (state) {
    case 'idle':
      emotionSource = require('../assets/emotions/blank.gif');
      break;
    case 'curious':
      emotionSource = require('../assets/emotions/distracted.gif');
      break;
    case 'happy':
      emotionSource = require('../assets/emotions/happy.gif');
      break;
    case 'gentle-concern':
      emotionSource = require('../assets/emotions/shy.gif');
      break;
    case 'sleepy':
      emotionSource = require('../assets/emotions/sleepy.gif');
      break;
    case 'plant-thirsty':
      emotionSource = require('../assets/emotions/rain.gif');
      break;
  }

  return (
    <View style={styles.container}>
      <Image 
        source={emotionSource} 
        style={styles.gifImage} 
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    borderRadius: 150,
    width: 300,
    height: 300,
    overflow: 'hidden',
    shadowColor: '#4cd137',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  gifImage: {
    width: '100%',
    height: '100%',
  }
});

export default CompanionFace;
