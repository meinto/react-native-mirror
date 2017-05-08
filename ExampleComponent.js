import React, {PureComponent} from 'react'
import {
  View,
  Text, 
  ScrollView,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native'


class Ex extends PureComponent {
  constructor() {
    super()
    this.state = {
      pressed1: false
    }
  }
  render() {
  return (
    <View
      style={{
        borderWidth: 1
      }}
    >
      <ScrollView
        contentContainerStyle={{
          padding: 10,
        }}
      >
        {['','','',''].map((_, i) => {
          return (
            <ScrollView
              key={i}
              horizontal={true}
              pagingEnabled={true}
              contentContainerStyle={{
                height: Dimensions.get('window').height / 2,
              }}
            >
              <View
                style={{
                  width: Dimensions.get('window').width / 2 - 22,
                  backgroundColor: '#ccc',
                  marginBottom: 10
                }}
              >
                <TouchableWithoutFeedback
                  onPressIn={() => {
                    this.setState({
                      pressed1: false,
                    })
                  }}
                  onPressOut={() => {
                    this.setState({
                      pressed1: true,
                    })
                  }}
                >
                <View>
                  <Text style={{
                    color: (this.state.pressed1) ? 'red' : 'black'
                  }}>{(!this.state.pressed1) ? 'PRESS ME!!!' : 'PRESSED - PRESSED - PRESSED - PRESSED'}</Text></View>
                </TouchableWithoutFeedback>
              </View>
              <View
                style={{
                  width: Dimensions.get('window').width / 2 - 22,
                  backgroundColor: '#eee',
                  marginBottom: 10
                }}
              >
                <Text>Test</Text>
              </View>
              <View
                style={{
                  width: Dimensions.get('window').width / 2 - 20,
                  backgroundColor: '#fff',
                  marginBottom: 10
                }}
              >
                <Text>Test</Text>
              </View>
            </ScrollView>
          )
        })}
      </ScrollView>
    </View>
  )
  }
}

export default Ex