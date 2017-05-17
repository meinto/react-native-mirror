/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
} from 'react-native';
import Mirror, { scrollviewBootstrap, touchableBootstrap } from './src/Mirror'
import Ex from './ExampleComponent'

export default class reactNativeMirror extends Component {
  render() {
    return (
      <View testID='123' style={styles.container}>
        <View style={{flex:1}}>
          <View style={{flex:1}}>
            <Mirror
              mirroredProps={[
                scrollviewBootstrap,
                
              ]}
            >
              <Ex mirrorChildren={true}/>   
            </Mirror>
          </View>
          <View style={{flex:1}}>
            <Mirror
              mirroredProps={[
                scrollviewBootstrap
              ]}
            >
              <Ex mirrorChildren={true}/>   
            </Mirror>
          </View>
        </View>
        <View style={{flex:1}}>

         <View style={{flex:1}}>
          <Mirror
            mirroredProps={[
              scrollviewBootstrap
            ]}
          >
              <Ex mirrorChildren={true}/>   
          </Mirror>
        </View>

         <View style={{flex:1}}>
          <Mirror
            mirroredProps={[
              scrollviewBootstrap
            ]}
          >
            <Ex mirrorChildren={true}/>            
          </Mirror>
        </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('reactNativeMirror', () => reactNativeMirror);
