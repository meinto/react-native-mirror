# react-native-mirror

[![npm version](https://badge.fury.io/js/react-native-mirror.svg)](https://badge.fury.io/js/react-native-mirror)
[![dependencie status](https://david-dm.org/tobiasMeinhardt/react-native-mirror.svg)](https://david-dm.org/tobiasMeinhardt/react-native-mirror)
[![dev-dependency status](https://david-dm.org/tobiasMeinhardt/react-native-mirror/dev-status.svg)](https://david-dm.org/tobiasMeinhardt/react-native-mirror?type=dev)
[![npm](https://img.shields.io/npm/dm/react-native-mirror.svg)](https://www.npmjs.com/package/react-native-mirror)
[![npm](https://img.shields.io/npm/dt/react-native-mirror.svg)](https://www.npmjs.com/package/react-native-mirror)

![Imgur](http://i.imgur.com/X72nd4Q.gif)

# Installation

```
npm install --save react-native-mirror
```

or 

```
yarn add react-native-mirror
```

# Usage

You can forward any prop to any instance-method or prop you want. Docs are coming soon... ;)

```javascript
import Mirror, {
  scrollviewBootstrap,
  touchableBootstrap,
} from 'react-native-mirror'

export default class MirrorExample extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Mirror mirroredProps={[
          scrollviewBootstrap,
          touchableBootstrap,
        ]}>
          <ExampleView mirrorChildren={true}/>
        </Mirror>
        <Mirror mirroredProps={[
          scrollviewBootstrap,
          touchableBootstrap,
        ]}>
          <ExampleView mirrorChildren={true}/>
        </Mirror>
      </View>
    )
  }
}
```