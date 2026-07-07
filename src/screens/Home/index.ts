import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  Dimensions,
  NativeModules,
  NativeEventEmitter,
  ToastAndroid,
  BackHandler,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Button from '../../Components/Button';
import DropDownPicker from 'react-native-dropdown-picker';
import styles from './style';
import BleManager from 'react-native-ble-manager';
import Loader from '../../Components/Loader';
import clc from 'cli-color';
import {bytesToString, stringToBytes} from 'convert-string';
import {useFocusEffect} from '@react-navigation/native';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const {width, height} = Dimensions.get('window');

const serId = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const writeCharId = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
const readCharId = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';

export default function Home({route, navigation}) {
  let macId = route.params.id;
  const [loading, setLoading] = useState(false);
  const [openColor, setOpenColor] = useState(false);
  const [openQuantity, setOpenQuantity] = useState(false);
  const [colorVal, setColorVal] = useState('');
  const [quantityVal, setQuantityVal] = useState('');
  const [colors, setColors] = useState([
    {label: 'Red', value: '0'},
    {label: 'Yellow', value: '1'},
    {label: 'Green', value: '2'},
    {label: 'Pink', value: '3'},
    {label: 'Black', value: '4'},
    {label: 'Aqua', value: '5'},
    {label: 'Aero_Blue', value: '6'},
    {label: 'Blue', value: '7'},
    {label: 'Magenta', value: '8'},
    {label: 'Gold', value: '9'},
    {label: 'Lightener', value: '10'},
  ]);
  const [quantity, setQuantity] = useState([
    {label: '20', value: 20},
    {label: '50', value: 50},
    {label: '100', value: 100},
  ]);

  const [readyStatus, setReadyStatus] = useState(false);
  const [bowlStatus, setBowlStatus] = useState(false);
  const [refillStatus, setRefillStatus] = useState(false);
  const [dispenseStatus, setDispenseStatus] = useState(false);

  useFocusEffect(
    useCallback(() => {
      console.log('mocx', macId);
      _connectDevice(macId);
      // return () =>;
    }, [macId]),
  );

  useEffect(() => {
    setReadyStatus(false);
    setBowlStatus(false);
    setRefillStatus(false);
    setDispenseStatus(false);
    const backAction = () => {
      Alert.alert('Hold on!', 'Are you sure you want to go exit App?', [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel',
        },
        {text: 'YES', onPress: () => BackHandler.exitApp()},
      ]);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => {
      backHandler.remove();
      bleManagerEmitter.removeAllListeners('BleManagerDiscoverPeripheral');
      console.log(clc.xterm(9)('Component unmounted'));
      _stopRead(macId);
      _stopScan();
    };
  }, []);

  const _retrieveServ = () => {
    setLoading(true);
    BleManager.retrieveServices(macId)
      .then(info => {
        console.log('aya', info);
        setTimeout(() => {
          read(macId);
        }, 1000);
      })
      .catch(e => {
        console.log('error aya retrieve pr', e);
        setLoading(false);
      });
  };

  function isJson(item) {
    item = typeof item !== 'string' ? JSON.stringify(item) : item;

    try {
      item = JSON.parse(item);
    } catch (e) {
      return false;
    }

    if (typeof item === 'object' && item !== null) {
      return true;
    }

    return false;
  }

  async function read(peripheral) {
    try {
      await BleManager.startNotification(peripheral, serId, readCharId);
      // Add event listener
      bleManagerEmitter.addListener(
        'BleManagerDidUpdateValueForCharacteristic',
        ({value, peripheral, characteristic, service}) => {
          // Convert bytes array to string
          const data = bytesToString(value);
          console.log(`Recieved ${data} for characteristic ${characteristic}`); //todo: date == {STATUS : r||d||f}

          if (isJson(data)) {
            const jsonData = JSON.parse(data);
            console.log('what?', jsonData.STATUS);
            if (jsonData.STATUS == '1') {
              setReadyStatus(true);
              setRefillStatus(false);
              setDispenseStatus(false);
            } else if (jsonData.STATUS == '2') {
              setDispenseStatus(true);
              setReadyStatus(false);
              setRefillStatus(false);
            } else if (jsonData.STATUS == '3') {
              setRefillStatus(true);
              setDispenseStatus(false);
              setReadyStatus(false);
            }
          } else {
            console.log('Data is not a json');
          }
        },
      );
      ToastAndroid.show('Ready to read', ToastAndroid.SHORT);
      setLoading(false);
    } catch (e) {
      console.log('Catch Error', e);
      setReadyStatus(false);
      ToastAndroid.show(
        'Error while Read, May have to Reconnect',
        ToastAndroid.SHORT,
      );
      setLoading(false);
    }
  }

  const _writeToDevice = firmUp => {
    if (firmUp) {
      const stringData = 'up';
      const bytesData = stringToBytes(stringData);
      console.log('XXX))XXX', stringData);
      BleManager.write(macId, serId, writeCharId, bytesData, 400)
        .then(() => {
          // Success code
          console.log('Write: ' + stringData);
          console.log('Write: ' + bytesData);
          // setDispenseStatus(!dispenseStatus);
        })
        .catch(error => {
          // Failure code
          console.log('Write Failed: ', error);
        });
    } else {
      const jsonData = {COLOR: colorVal, QUANTITY: quantityVal.toString()};
      const stringData = JSON.stringify(jsonData);
      const bytesData = stringToBytes(stringData);
      console.log('XXX))XXX', stringData);
      BleManager.write(macId, serId, writeCharId, bytesData, 400)
        .then(() => {
          // Success code
          console.log('Write: ' + stringData);
          console.log('Write: ' + bytesData);
          // setDispenseStatus(!dispenseStatus);
        })
        .catch(error => {
          // Failure code
          console.log('Write Failed: ', error);
        });
    }
  };

  const _stopRead = async peripheralId => {
    setQuantityVal('');
    setColorVal('');
    try {
      await BleManager.stopNotification(peripheralId, serId, readCharId);
      bleManagerEmitter.removeAllListeners(
        'BleManagerDidUpdateValueForCharacteristic',
      );
      BleManager.refreshCache(peripheralId)
        .then(() => {
          // Success code
          _disconnectDevice(macId);
          console.log('cache refreshed!');
        })
        .catch(error => {
          console.error(error);
        });
      console.log('stopped Notify');
    } catch (e) {
      if (e == 'Device is not connected') {
        navigation.navigate('Scan');
      }
      console.log('error', e);
    }
  };

  const _disconnectDevice = peripheral => {
    BleManager.disconnect(peripheral)
      .then(() => {
        // Success code
        console.log(clc.xterm(190)('Disconnected'));
        macId = '';
        navigation.push('Scan');
      })
      .catch(error => {
        // Failure code
        console.log('Disonnect Failed: ', error);
      });
  };

  const _stopScan = () => {
    BleManager.stopScan().then(() => {
      // Success code
      bleManagerEmitter.removeAllListeners('BleManagerDiscoverPeripheral');
      console.log(clc.xterm(209)('Stopped Scanning'));
    });
  };

  const someTest = () => {
    BleManager.isPeripheralConnected(macId).then(isConnected => {
      if (isConnected) {
        console.log('Peripheral is connected!');
      } else {
        console.log('Peripheral is NOT connected!');
      }
    });
  };

  const renderColorVal = colorVal => {
    switch (colorVal) {
      case '0':
        return 'Red';
      case '1':
        return 'Yellow';
      case '2':
        return 'Green';
      case '3':
        return 'Pink';
      case '4':
        return 'Black';
      case '5':
        return 'Aqua';
      case '6':
        return 'Aero_Blue';
      case '7':
        return 'Blue';
      case '8':
        return 'Magenta';
      case '9':
        return 'Gold';
      case '10':
        return 'Lightener';
      default:
        return '';
    }
  };

  const _connectDevice = macId => {
    // setLoading(true)
    BleManager.connect(macId)
      .then(() => {
        console.log('Connected');
        setTimeout(() => {
          _retrieveServ();
        }, 800);
        ToastAndroid.show('Connected Successfully', ToastAndroid.SHORT);
      })
      .catch(e => {
        console.log('Not Connected', e);
      });
  };

  console.log('Values', colorVal);
  console.log('Values', quantityVal);
  return (
    <>
      <Loader loading={loading} />
      <View style={styles.mainContainer}>
        <View
          style={{
            flexDirection: 'row',
            width: width,
            paddingHorizontal: 8,
            justifyContent: 'space-between',
          }}>
          <Button
            iconName={'wifi'}
            style={styles.buttonRound}
            onPress={() => {
              navigation.navigate('Wifi', {macId});
            }}
          />
          <Button
            iconName={'close'}
            style={styles.buttonRound}
            onPress={() => {
              _stopRead(macId);
            }}
          />
        </View>
        <Text style={styles.mainHeading}>YUV</Text>
        <View style={styles.contentContainer}>
          <DropDownPicker
            textStyle={{textTransform: 'uppercase'}}
            open={openColor}
            value={colorVal}
            items={colors}
            setOpen={setOpenColor}
            setValue={value => setColorVal(value)}
            setItems={setColors}
            placeholder="Choose Color"
          />
          <DropDownPicker
            style={{zIndex: 0}}
            textStyle={{textTransform: 'uppercase'}}
            open={openQuantity}
            value={quantityVal}
            items={quantity}
            setOpen={setOpenQuantity}
            setValue={value => setQuantityVal(value)}
            setItems={setQuantity}
            placeholder="Choose Quantity"
          />
          <Button
            title="Dispense"
            onPress={() => {
              colorVal !== '' && quantityVal !== ''
                ? _writeToDevice(false)
                : ToastAndroid.show(
                    'Select Color and Quantity',
                    ToastAndroid.SHORT,
                  );
            }}
            style={styles.button}
            textStyle={{textTransform: 'uppercase'}}
          />

          <View style={styles.valueContainer}>
            <View>
              <Text style={styles.valueText}>Status:</Text>
              <Text style={styles.valueText}>{`${
                readyStatus ? 'Ready' : 'Not Ready'
              } / ${refillStatus ? 'Refill' : ''}`}</Text>
              <Text style={styles.valueText}>{`${renderColorVal(
                colorVal,
              )} ${quantityVal} / ${
                dispenseStatus ? 'Dispensing' : 'Not Dispensing'
              } /`}</Text>
            </View>
          </View>
          <View style={{marginTop: 15}}>
            <TouchableOpacity
              style={styles.fuBtn}
              onPress={() => _writeToDevice(true)}>
              <Text style={styles.valueText}>Firmware Update</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
}
