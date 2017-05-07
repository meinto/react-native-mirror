import React, {Component} from 'react'
import {
  View,
  Text, 
  ScrollView,
  Dimensions,
} from 'react-native'


class Ex extends Component {
  render() {
  return (
    <ScrollView>
      <View
        style={{
          height: Dimensions.get('window').height / 2,
          backgroundColor: '#ccc',
        }}
      >
        <Text>Test</Text>
      </View>
      <View
        style={{
          height: Dimensions.get('window').height / 2,
          backgroundColor: '#eee',
        }}
      >
        <Text>Test</Text>
      </View>
      <View
        style={{
          height: Dimensions.get('window').height / 2,
          backgroundColor: '#fff',
        }}
      >
        <Text>Test</Text>
      </View>
    </ScrollView>
  )
  }
}

export default Ex