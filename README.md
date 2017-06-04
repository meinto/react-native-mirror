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

# Basic Usage

With ```react-native-mirror``` you can inject all properties of a component and forward the result of the prop-function to a clone of the component. The data can be forwarded to another prop or to an instance function of the same hirarchic component. 

Let's say we have a the following viewtree and a "clone" of it:

```javascript
const component = () => (
    <View>
        <ScrollView />
    </View>
)

// it has the same structure like the component above
const cloneComponent = () => (
    <View>
        <ScrollView />
    </View>
)
```

Now you want to forward the scroll position of the first ```<ScrollView />``` to the second ```<ScrollView />```. All you have to do is to wrap both components with the ```<Mirror />``` component and add the ```scrollviewBootstrap``` variable from the lib to ```mirroredProps``` like below.

```javascript
import Mirror, { scrollviewBootstrap } from 'react-native-mirror'

const component = () => (
    <Mirror mirroredProps={[scrollviewBootstrap]}>
        <View>
            <ScrollView />
        </View>
    </Mirror>
)

// it has the same structure like the component above
const cloneComponent = () => (
    <Mirror mirroredProps={[scrollviewBootstrap]}>
        <View>
            <ScrollView />
        </View>
    </Mirror>
)
```
## Bootstraps

At the moment there are bootstraps for basic prop-forwarding for ```<ScrollView />``` and all kinds of ```<TouchableHighlight />```:

* scrollviewBootstrap
* touchableBootstrap

Simply add them to the ```mirroredProps``` property of the ```<Mirror />```. The ```scrollviewBootstrap``` forwards the scroll position to the cloned ```<ScrollView />``` ('s) and make it scroll to the same position.

Be careful with the ```touchableBootstrap```. It forwards the onPress (onPressIn, onPressOut, ...) property to the clone. Keep in mind, that this triggers the property action also on the clone (maybe a download or navigation action or something).

## Custom forwarding / injection

The ```mirroredProps``` property of the ```<Mirror />``` takes an array of forwarding objects. The objects must have the folowing structure:

```javascript
{
    // array of strings of component types. e.g.: 'ScrollView'
    componentTypes: React.PropTypes.array,
    // name of the property you want to forward. e.g.: 'onScroll'
    fromProp: React.PropTypes.string,
    
    // name of the clone-property which receives the data. e.g.: 'customScrollTo'
    toProp: React.PropTypes.string,
    // or
    // name of the clone-instanceMethod which receives the data. e.g.: 'scrollTo'
    toInstance: React.PropTypes.string,
    
    // function to extract the forwarding data 
    dataExtractor: React.PropTypes.func,
}
```

The ```dataExtractor``` receives the plain data from the property defined in ```fromProp``` and returns the data which should be forwarded...

## Example with custom components

When you want to mirror custom components you have different choises. You can turn on the auto component detection with the property ```experimentalComponentDetection={true}```, set on the ```<Mirror />``` component. Like the name sais, this functionality is experimental...

When you don't want to use the auto detection you have to flag your custom components with a property ```mirrorClassComponent={true}``` or ```mirrorFunctionalComponent={true}```. Be careful with this and make sure you set them properly (```mirrorClassComponent``` for **class components only** and ```mirrorFunctionalComponent``` for **functional components only**!)

If you don't set them right your app will throw a error message *"Cannot call a class as a function"*.

### Example with auto detection

```javascript
import Mirror, {
  scrollviewBootstrap,
  touchableBootstrap,
} from 'react-native-mirror'

export default class MirrorExample extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Mirror
            experimentalComponentDetection={true}
            mirroredProps={[
              scrollviewBootstrap,
              touchableBootstrap,
            ]}
        >
          <ExampleView />
        </Mirror>
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
    )
  }
}
```

### Example with manual component detection

In the following example i assume that the custom Component ```<ExampleView />``` is a class component.

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
          <ExampleView mirrorClassComponent={true}/>
        </Mirror>
        <Mirror mirroredProps={[
          scrollviewBootstrap,
          touchableBootstrap,
        ]}>
          <ExampleView mirrorClassComponent={true}/>
        </Mirror>
      </View>
    )
  }
}
```

# API

| prop name                      | functionality                                                   |
| ------------------------------ | --------------------------------------------------------------- |
| connectionId                   | an Id that indicates which Mirrors are connected                |
| containerStyle                 | style the Mirror view-container (normaly not needed)            |
| mirroredProps                  | see the description in the topic above                          |
| experimentalComponentDetection | mirrors custom components automatically (see description above) |

# Questions, enhancements or improvements?

... then open up an issue! :)
