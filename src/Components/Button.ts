import React, {Component} from 'react';
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Image,
  Picker,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import {Icon} from 'react-native-elements';
// import {Fonts} from '../utils/fonts';
// import LinearGradient from 'react-native-linear-gradient';

// import styles from './styles';
// import {Images, Metrics, Fonts, Colors} from '../../theme';

//
const {width, height} = Dimensions.get('window');

const Button = ({
  title,
  onPress,
  style,
  textStyle,
  iconName,
  iconSize,
  activeOpacity,
}) => {
  // console.log('AyAS', style.width);
  return (
    <TouchableOpacity
      activeOpacity={activeOpacity ? activeOpacity : 0.6}
      onPress={onPress}
      style={[styles.submitBtn, style]}>
      {!title == '' ? (
        <Text style={[styles.submitBtnText, textStyle]}>{title}</Text>
      ) : (
        <Icon
          name={iconName}
          type="material-community"
          color="#fff"
          size={20}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  submitBtn: {
    // flex:1,
    // backgroundColor: '#5432D3',
    // elevation: height * 0.002,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: height * 0.01,
    borderColor: '#ffffff0c',
  },
  submitBtnLinear: {
    // flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: height * 0.01,
    // margin:height * .01,
    borderWidth: height * 0.002,
    borderColor: '#363B40',
  },
  submitBtnText: {
    // fontFamily: Fonts.Lato,
    fontSize: height * 0.02,
    color: 'white',
    margin: height * 0.01,
  },
});

export default Button;
