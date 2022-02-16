import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Dimensions,
  ToastAndroid,
} from 'react-native';
import Button from '../../Components/Button';
import BleManager from 'react-native-ble-manager';
import {bytesToString, stringToBytes} from 'convert-string';
import {Icon} from 'react-native-elements';

const {width, height} = Dimensions.get('window');

const serId = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const writeCharId = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
const readCharId = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';

export default function index({navigation, route}) {
  let macId = route.params.macId;
  const [ssid, setSsid] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(true);

  const sendToDevice = () => {
    if (ssid !== '' || pass !== '') {
      const jsonData = {ssid: ssid, psk: pass};
      const stringData = JSON.stringify(jsonData);
      const bytesData = stringToBytes(stringData);
      console.log('XXX))XXX', stringData);
      BleManager.write(macId, serId, writeCharId, bytesData, 400)
        .then(() => {
          // Success code
          console.log('Write: ' + stringData);
          console.log('Write: ' + bytesData);
          ToastAndroid.show('Sent Successfully', ToastAndroid.SHORT);
          setSsid('');
          setPass('');
        })
        .catch(error => {
          // Failure code
          console.log('Write Failed: ', error);
        });
    } else {
      ToastAndroid.show('Both Field are Required', ToastAndroid.SHORT);
    }
  };

  return (
    <>
      <View style={styles.container}>
        <View style={{flex: 1, alignSelf: 'flex-start', padding: 10}}>
          <Button
            iconName={'keyboard-backspace'}
            style={styles.buttonRound}
            onPress={() => {
              navigation.goBack();
            }}
          />
        </View>
        <View style={{flex: 2, alignItems: 'center'}}>
          <Text style={{fontSize: width * 0.08, color: '#fff', bottom: 20}}>
            CONFIGURE WIFI
          </Text>
          <View style={styles.textInputContainer}>
            <TextInput
              value={ssid}
              autoCorrect={false}
              autoCapitalize={false}
              autoCompleteType="off"
              onChangeText={text => setSsid(text)}
              placeholder={'Enter SSID'}
              placeholderTextColor={'#888888'}
              keyboardType="default"
              style={{
                flex: 1,
                color: '#fff',
                paddingLeft: 20,
                fontSize: 25,
                letterSpacing: 1,
              }}
            />
          </View>
          <View style={styles.textInputContainer}>
            <TextInput
              value={pass}
              autoCorrect={false}
              autoCapitalize={false}
              autoCompleteType="off"
              onChangeText={text => setPass(text)}
              placeholder={'Enter PASS'}
              placeholderTextColor={'#888888'}
              keyboardType="default"
              secureTextEntry={showPass}
              style={{
                flex: 1,
                color: '#fff',
                paddingLeft: 20,
                fontSize: 25,
                letterSpacing: 1,
              }}
            />
            <Icon
              name={'eye'}
              type="material-community"
              color={!showPass ? '#fff' : '#888888'}
              size={30}
              onPress={() => setShowPass(!showPass)}
              containerStyle={{paddingRight: 20}}
            />
          </View>
          <Button
            title="Send"
            onPress={sendToDevice}
            style={[styles.button, {top: 20}]}
            textStyle={{textTransform: 'uppercase'}}
          />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  button: {
    backgroundColor: '#888888',
    height: height * 0.06,
    width: width * 0.4,
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: height * 0.0027,
    borderColor: '#888888',
    width: width * 0.75,
    height: height * 0.07,
    borderRadius: height * 0.05,
    elevation: height * 0.002,
    margin: 8,
  },
  buttonRound: {
    backgroundColor: '#888888',
    height: height * 0.06,
    width: height * 0.06,
  },
});
