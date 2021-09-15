import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Dimensions,
  TextInput,
  NativeModules,
  NativeEventEmitter,
  PermissionsAndroid,
  ToastAndroid,
  Alert,
} from 'react-native';
import Button from '../../Components/Button';
import Loader from '../../Components/Loader';
import BleManager from 'react-native-ble-manager';
import SystemSetting from 'react-native-system-setting';
import clc from 'cli-color';

const {width, height} = Dimensions.get('window');

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

export default function index({navigation}) {
  const [permissionEnabled, setPermissionEnabled] = useState(false);
  const [scanData, setScanData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    _askPermissions();
    _locationPermission();
    _requestBluetoothPermission();
  }, []);

  const _askPermissions = () => {
    try {
      PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      ]).then(results => {
        if (
          results['android.permission.ACCESS_FINE_LOCATION'] &&
          results['android.permission.ACCESS_COARSE_LOCATION'] === 'granted'
        ) {
          setPermissionEnabled(true),
            console.log('Permission are Accepted already');
        } else if (
          (results['android.permission.ACCESS_FINE_LOCATION'] &&
            results['android.permission.ACCESS_COARSE_LOCATION'] ===
              'denied') ||
          (results['android.permission.ACCESS_FINE_LOCATION'] &&
            results['android.permission.ACCESS_COARSE_LOCATION'] ===
              'never_ask_again')
        ) {
          ToastAndroid.show(
            'App cannot Start Without Accepting Permission',
            ToastAndroid.SHORT,
          );
        }
      });
    } catch (err) {
      console.log('permission ask failed: ', err);
    }
  };

  const _locationPermission = () => {
    console.log('Chala Location Function');
    SystemSetting.isLocationEnabled().then(enable => {
      if (enable) {
        console.log('Location is On');
      } else {
        Alert.alert(
          'Turn Location On',
          'Dual Camera App wants to turn on your Location',
          [
            {
              text: 'Cancel',
              onPress: () => console.log('Cancel Pressed on Location Setting'),
              style: 'cancel',
            },
            {
              text: 'Settings',
              onPress: () => {
                SystemSetting.switchLocation();
              },
            },
          ],
        );
      }
    });
  };

  const _requestBluetoothPermission = () => {
    BleManager.enableBluetooth()
      .then(() => {
        console.log('The bluetooth is already enabled or the user confirmed');
        turnOnBLE();
      })
      .catch(() => {
        Alert.alert(
          'Turn Bluetooth',
          'This App wants to turn on your bluetooth',
          [
            {
              text: 'Cancel',
              onPress: () =>
                console.log('Cancel Pressed on Bluetooth Permissions'),
              style: 'cancel',
            },
            {
              text: 'Settings',
              onPress: () => {
                SystemSetting.switchBluetooth();
              },
            },
          ],
        );
      });
  };

  const turnOnBLE = () => {
    BleManager.start({showAlert: false, forceLegacy: true}).then(() => {
      // Success code
      console.log('Module initialized');
      _scanAndGet();
    });
  };

  const _scanAndGet = () => {
    setLoading(true);
    setScanData([]);
    BleManager.scan([], 10, true).then(() => {
      console.log('Scan started');
      bleManagerEmitter.addListener(
        'BleManagerDiscoverPeripheral',
        ({name, id, rssi}) => {
          console.log('kia aya name', clc.xterm(75)(name));
          console.log('kya aya id', clc.xterm(179)(id));
          console.log('kia aya rssi', clc.xterm(225)(rssi));
        },
      );
      setTimeout(() => {
        BleManager.getDiscoveredPeripherals([]).then(peripheralsArray => {
          // Success code
          setScanData(peripheralsArray);
        });
        setLoading(false);
      }, 10000);
    });
  };

  const renderList = ({item}) => {
    console.log('XXXXX', scanData.length);
    return (
      <TouchableOpacity
        onPress={() => {
          Alert.alert('Are You Sure?', 'Device will be connected', [
            {
              onPress: () => {
                navigation.navigate('Home', {id: item.id});
                // setLoading(true);
              },
              text: 'Ok',
              style: 'default',
            },
            {
              onPress: () => console.log('canceled'),
              text: 'Cancel',
              style: 'cancel',
            },
          ]);
        }}>
        <View>
          <Text style={{color: '#fff', fontSize: width * 0.06}}>
            {item.name == null ? 'N/A' : item.name}
          </Text>
          <Text style={{color: '#929090', fontSize: width * 0.045}}>
            {item.id}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#000',
        height: height,
      }}>
      <Loader loading={loading} />
      <View style={{padding: height * 0.05}}>
        {scanData.length == 0 ? (
          <View style={{alignItems: 'center'}}>
            <Text style={{color: '#fff', fontSize: width * 0.06}}>
              No Devices Found
            </Text>
          </View>
        ) : (
          <FlatList
            data={scanData}
            renderItem={renderList}
            ItemSeparatorComponent={() => {
              return (
                <View
                  style={{
                    borderWidth: height * 0.001,
                    borderColor: '#fff',
                    marginVertical: height * 0.02,
                  }}
                />
              );
            }}
          />
        )}

        <View style={{marginTop: height * 0.05, alignItems: 'center'}}>
          <Button
            title="Re-Scan"
            onPress={_scanAndGet}
            style={styles.button}
            textStyle={{textTransform: 'uppercase'}}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#888888',
    height: height * 0.06,
    width: width * 0.4,
  },
});
