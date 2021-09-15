import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Dimensions,
  NativeModules,
  NativeEventEmitter,
  ToastAndroid,
  BackHandler,
  Alert,
} from 'react-native';
import Button from '../../Components/Button';
import DropDownPicker from 'react-native-dropdown-picker';
import styles from './style';
import BleManager from 'react-native-ble-manager';
import Loader from '../../Components/Loader';
import clc from 'cli-color';
import { bytesToString, stringToBytes } from 'convert-string';
import { useFocusEffect } from '@react-navigation/native';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const { width, height } = Dimensions.get('window');

const serId = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const writeCharId = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
const readCharId = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';

export default function Home({ route, navigation }) {
  let macId = route.params.id;
  const [loading, setLoading] = useState(false);
  const [openColor, setOpenColor] = useState(false);
  const [openQuantity, setOpenQuantity] = useState(false);
  const [colorVal, setColorVal] = useState('');
  const [quantityVal, setQuantityVal] = useState('');
  const [colors, setColors] = useState([
    { label: 'Red', value: 'RED' },
    { label: 'Green', value: 'GREEN' },
    { label: 'Blue', value: 'BLUE' },
  ]);
  const [quantity, setQuantity] = useState([
    { label: '20', value: 20 },
    { label: '50', value: 50 },
    { label: '100', value: 100 },
  ]);

  const [readyStatus, setReadyStatus] = useState(false);
  const [bowlStatus, setBowlStatus] = useState(false);
  const [refillStatus, setRefillStatus] = useState(false);
  const [dispenseStatus, setDispenseStatus] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
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
        { text: 'YES', onPress: () => BackHandler.exitApp() },
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
        ({ value, peripheral, characteristic, service }) => {
          // Convert bytes array to string
          const data = bytesToString(value);
          console.log(`Recieved ${data} for characteristic ${characteristic}`); //todo: date == {STATUS : r||d||f}

          if (isJson(data)) {
            const jsonData = JSON.parse(data);
            console.log('what?', jsonData.STATUS)
            if (jsonData.STATUS == 'r') {
              setReadyStatus(true);
              setRefillStatus(false);
              setDispenseStatus(false);
            }
            else if (jsonData.STATUS == 'd') {
              setDispenseStatus(true);
              setReadyStatus(false);
              setRefillStatus(false);
            }
            else if (jsonData.STATUS == 'f') {
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

  const _writeToDevice = () => {
    const jsonData = { COLOR: colorVal, QUANTITY: quantityVal.toString() };
    const stringData = JSON.stringify(jsonData);
    const bytesData = stringToBytes(stringData);
    console.log('XXX))XXX', stringData)
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

  const _connectDevice = macId => {
    // setLoading(true)
    BleManager.connect(macId).then(() => {
      console.log('Connected');
      setTimeout(() => {
        _retrieveServ();
      }, 800);
      ToastAndroid.show('Connected Successfully', ToastAndroid.SHORT);
    }).catch((e) => {
      console.log('Not Connected', e);

    })
  };

  console.log('Values', colorVal);
  console.log('Values', quantityVal);
  return (
    <>
      <Loader loading={loading} />
      <View style={styles.mainContainer}>
        <View
          style={{
            width: width,
            height: height * 0.05,
            justifyContent: 'center',
            alignItems: 'flex-end',
          }}>
          <Button
            title="X"
            style={styles.buttonRound}
            onPress={() => {
              _stopRead(macId);
            }}
            textStyle={{ fontSize: height * 0.03 }}
          />
        </View>
        <Text style={styles.mainHeading}>YUV</Text>
        <View style={styles.contentContainer}>
          <DropDownPicker
            textStyle={{ textTransform: 'uppercase' }}
            open={openColor}
            value={colorVal}
            items={colors}
            setOpen={setOpenColor}
            setValue={value => setColorVal(value)}
            setItems={setColors}
            placeholder="Choose Color"
          />
          <DropDownPicker
            style={{ zIndex: 0 }}
            textStyle={{ textTransform: 'uppercase' }}
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
                ? _writeToDevice()
                : ToastAndroid.show(
                  'Select Color and Quantity',
                  ToastAndroid.SHORT,
                );
            }}
            style={styles.button}
            textStyle={{ textTransform: 'uppercase' }}
          />

          <View style={styles.valueContainer}>
            <View>
              <Text style={styles.valueText}>Status:</Text>
              <Text style={styles.valueText}>{`${readyStatus ? 'Ready' : 'Not Ready'
                } / ${refillStatus ? 'Refill' : ''}`}</Text>
              <Text style={styles.valueText}>{`${colorVal} ${quantityVal} / ${dispenseStatus ? 'Dispensing' : 'Not Dispensing'
                } /`}</Text>
            </View>
          </View>
        </View>
      </View>
    </>
  );
}
