import {StyleSheet, Dimensions, Platform} from 'react-native';

const {height, width} = Dimensions.get('window');
const screenHeight = Dimensions.get('screen').height;
const screenWidth = Dimensions.get('screen').width;

const styles = StyleSheet.create({
  mainContainer: {
    width: width * 1,
    height: height * 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  mainHeading: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: width * 0.2,
  },
  contentContainer: {
    width: width * 0.8,
    height: height * 0.7,
    display: 'flex',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#888888',
    height: height * 0.06,
    width: width * 0.4,
  },
  buttonRound: {
    backgroundColor: '#888888',
    height: height * 0.06,
    width: height * 0.06,
  },
  valueContainer: {
    borderWidth: width * 0.008,
    borderRadius: width * 0.02,
    borderColor: '#888888',
    width: width * 0.8,
    height: height * 0.2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueText: {
    color: '#888888',
    fontSize: width * 0.055,
  },
});

export default styles;
