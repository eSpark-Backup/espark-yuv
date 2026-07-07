import React, { useState } from 'react'
import { Dimensions } from 'react-native';

import { Picker } from '@react-native-picker/picker';
const { width, height } = Dimensions.get('window')


export default function PickerJS({ }) {
    const [selectedLanguage, setSelectedLanguage] = useState();

    return (
        <Picker
            style={{ backgroundColor: '#fde', marginVertical: height * .01 }}
            selectedValue={selectedLanguage}
            onValueChange={(itemValue, itemIndex) =>
                setSelectedLanguage(itemValue)
            }>
            <Picker.Item label="Java" value="java" />
            <Picker.Item label="JavaScript" value="js" />
        </Picker>
    )
}