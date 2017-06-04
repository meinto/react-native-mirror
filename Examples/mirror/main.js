/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react'
import {
  AppRegistry,
  StyleSheet,
  View,
  Dimensions,
} from 'react-native'

import ExampleView from './ExampleView'
// import ExampleView from './ExampleViewFunctional'

/*
 * IMPORTANT
 * ---------
 * in live version import like follows:
 * >>> import { Mirror } from 'react-native-mirror' <<<
 * 
 * the following import is only to improve the developer experience
 */
import Mirror, {
  scrollviewBootstrap,
  touchableBootstrap,
} from './react-native-mirror/Mirror'

export default class MirrorExample extends Component {
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.mirrorContainer}>
          <Mirror 
            experimentalComponentDetection={true}
            mirroredProps={[
              scrollviewBootstrap,
              touchableBootstrap,
            ]}
          >
            <ExampleView/>
          </Mirror>
        </View>
        <View style={styles.mirrorContainer}>
          <Mirror 
            experimentalComponentDetection={true}
            mirroredProps={[
              scrollviewBootstrap,
              touchableBootstrap,
            ]}
          >
            <ExampleView />
          </Mirror>
        </View>
        <View style={styles.mirrorContainer}>
          <Mirror 
            experimentalComponentDetection={true}
            mirroredProps={[
              scrollviewBootstrap,
              touchableBootstrap,
            ]}
          >
            <ExampleView/>
          </Mirror>
        </View>
        <View style={styles.mirrorContainer}>
          <Mirror 
            experimentalComponentDetection={true}
            mirroredProps={[
              scrollviewBootstrap,
              touchableBootstrap,
            ]}
          >
            <ExampleView />
          </Mirror>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexWrap: 'wrap',
    flexDirection: 'row',
  },
  mirrorContainer: {
    width: Dimensions.get('window').width / 2,
    height: Dimensions.get('window').height / 2 - 12,
  },
})

AppRegistry.registerComponent('mirror', () => MirrorExample)
