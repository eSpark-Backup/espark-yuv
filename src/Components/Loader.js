import React from 'react';
import {ActivityIndicator, Dimensions} from 'react-native';
import Modal from 'react-native-modal';

function Loader({loading}) {
  const {width, height} = Dimensions.get('window');
  return (
    <Modal isVisible={loading}>
      <ActivityIndicator size="large" color="#4f55bd" />
    </Modal>
  );
}

export default Loader;
