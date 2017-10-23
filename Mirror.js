import React, { PureComponent,Children } from 'react';
import { View } from 'react-native';
import type from 'type-detect';
import { EventRegister } from 'react-native-event-listeners';
import PropTypes from 'prop-types';

class Mirror extends PureComponent {

  static defaultProps = {
    connectionId: 'mirror',
    containerStyle: {},
    mirroredProps: [],
    experimentalComponentDetection: false,
    _isRootMirror: true,
  }

  static propTypes = {
    connectionId: PropTypes.string,
    mirroredProps: PropTypes.array,
    experimentalComponentDetection: PropTypes.bool,
    _isRootMirror: PropTypes.bool,
    children: PropTypes.any,
    containerStyle: PropTypes.any,
  }

  constructor(props) {
    super(props)

    this.mirroredProps = []
    
    this.props.mirroredProps.forEach(_prop => {
      if (type(_prop) === 'Array')
        this.mirroredProps = [...this.mirroredProps, ..._prop]
      else 
        this.mirroredProps = [...this.mirroredProps, _prop]
    })

    this._isSlave = true
    this._reset()

    this.state = {
      children: null,
    }
  }


  componentWillUnmount() {
    this._unregisterListeners()
  }


  _reset = () => {
    this._refNum = 0
    this.references = {}
    this.listeners = []
  }

  _inject = (name, ref, data) => {
    if (!this._isSlave) {
      EventRegister.emit(name, {
        emitter: this,
        connectionId: this.props.connectionId,
        ref,
        data,
      })
    }
  }

  _mapChildren = (children) => {
    return Children.map(children, _child => {
      let clonedElement = _child

      let typeName = false

      if (type(_child.type) === 'string')
        typeName = _child.type
      else if (_child.type && _child.type.displayName) 
        typeName = _child.type.displayName
      
      if (!typeName && _child.type) {

        const isClassComponent = typeof _child.type === 'function' && /(\.classCallCheck)/.test(_child.type.toString())

        const mirroredProps = [...this.mirroredProps]
        const innerMirrorProps = Object.assign({}, this.props, {
          children: [],
        })

        if (
          _child.props.mirrorClassComponent === true ||
          this.props.experimentalComponentDetection === true && isClassComponent
        ) {
          /* inheritance inversion to inject child tree of component */
          const ClassToExtend = _child.type
          class InjectChildTree extends ClassToExtend {
            render() {
              return (
                <Mirror
                  {...innerMirrorProps}
                  mirroredProps={[...mirroredProps]}
                  _isRootMirror={false}
                >
                  {super.render()}
                </Mirror>
              )
            }
          }

          clonedElement = (
            <InjectChildTree
              {..._child.props}
            />
          )
        } else if (
          _child.props.mirrorFunctionalComponent === true ||
          this.props.experimentalComponentDetection === true && !isClassComponent
        ) {
          class InjectChildTree extends React.Component {
            render() {
              return (
                <Mirror
                  {...innerMirrorProps}
                  mirroredProps={[...mirroredProps]}
                  _isRootMirror={false}
                >
                  {_child.type()}
                </Mirror>
              )
            }
          }

          clonedElement = (
            <InjectChildTree
              {..._child.props}
            />
          )
        } else {
          clonedElement = React.createElement(_child.type)
        }

      } else if (typeName) {
        let injectedProps = {}

          /* store a reference of every child element */
        const _ref = 'mirror-' + this._refNum++
          
          /* prepare forwards
          * example: 
            { 
              onScroll: { 
                forwardToInstance: ['scrollTo'], 
                forwardToProp: ['customProp'], 
                dataExtractor 
              } 
            }
          */
        const forwards = {}
        this.mirroredProps.forEach(_forwardConfig => {
          const shouldForward = _forwardConfig.componentTypes.includes(typeName)
          if (shouldForward) {
            if (forwards[_forwardConfig.fromProp] === undefined)
              forwards[_forwardConfig.fromProp] = []
            forwards[_forwardConfig.fromProp] = {
              forwardToInstance: [...forwards[_forwardConfig.fromProp], _forwardConfig.toInstance]
                  .filter(fn => fn !== undefined),
              forwardToProp: [...forwards[_forwardConfig.fromProp], _forwardConfig.toProp]
                  .filter(fn => fn !== undefined),
              dataExtractor: _forwardConfig.dataExtractor,
            }
          }
        })

        Object.keys(forwards).forEach(_key => {
          const originalProp = _child.props[_key]

          injectedProps[_key] = (...args) => {
            const _args = (args.length > 1) ? args : args[0]
            forwards[_key].forwardToInstance.forEach(name => {
              this._inject(name, _ref, _args)
            })
            forwards[_key].forwardToProp.forEach(name => {
              this._inject(name, _ref, _args)
            })
            if (type(originalProp) === 'function')
              (args.length > 1) ? originalProp(...args) : originalProp(args[0])
          }

          forwards[_key].forwardToInstance.forEach(name => {
            this._registerInstanceListener(name, _ref, forwards[_key].dataExtractor)
          })
          forwards[_key].forwardToProp.forEach(name => {
            this._registerPropertyListener(name, _ref, forwards[_key].dataExtractor)
          })
        })

        let children = _child.props.children && this._mapChildren(_child.props.children) || []
        children = (children.length > 1) ? children : children[0]

        injectedProps = Object.assign({}, _child.props, injectedProps, {
          ref: node => {
            this.references[_ref] = node 

            const {ref} = _child 
            if (type(ref) === 'function') {
              ref(node)
            }
          },
          children,
        })

        clonedElement = React.cloneElement(_child, injectedProps)
      }

      return clonedElement
    })
  }

  _prepareChildren = () => {
    this._unregisterListeners()
    this._reset()
    return this._mapChildren(this.props.children)
  }

  _registerInstanceListener(name, ref, dataExtractor) {
    this._registerListener(name, ref, dataExtractor, false)
  }

  _registerPropertyListener(name, ref, dataExtractor) {
    this._registerListener(name, ref, dataExtractor, true)
  }

  _registerListener = (name, ref, dataExtractor, isProperty) => {
    this.listeners = [...this.listeners, EventRegister.on(name, data => {
      if (
        data.ref === ref && 
        data.emitter !== this &&
        data.connectionId === this.props.connectionId
      ) {
        this._isSlave = true

        const referenceFunction = (isProperty) 
          ? this.references[ref].props[name]
          : this.references[ref][name]

        if (type(referenceFunction) !== 'function') {
          return false
        }

        if (
          type(data.data) === 'Array'
        ) {
          referenceFunction(dataExtractor(...data.data))
        } else {
          referenceFunction(dataExtractor(data.data))
        }
      }
    })]
  }

  _unregisterListeners = () => {
    [...this.listeners].forEach(_id => {
      EventRegister.rm(_id)
    })
  }

  render() {
    return <View
      onStartShouldSetResponderCapture={() => {
        this._isSlave = false
        return false
      }}
      style={this.props.containerStyle}
    >{this._prepareChildren()}</View>
  }

}


export default Mirror

/*
 * mirror bootstrap
 */

export const scrollviewBootstrap = [
  {
    componentTypes: [
      'ScrollView',
    ],
    fromProp: 'onScroll',
    toInstance: 'scrollTo',
    dataExtractor: event => {
      return {
        y: event.nativeEvent.contentOffset.y,
        x: event.nativeEvent.contentOffset.x,
        animated: false,
      }
    },
  },
  { 
    componentTypes: [
      'FlatList',
    ],
    fromProp: 'onScroll',
    toInstance: 'scrollToOffset',
    dataExtractor: event => {
      return {
        y: event.nativeEvent.contentOffset.y,
        x: event.nativeEvent.contentOffset.x,
        animated: false,
      }
    },
  },
]

export const touchableBootstrap = [
  {
    componentTypes: [
      'TouchableHighlight',
      'TouchableWithoutFeedback',
      'TouchableOpacity',
    ],
    fromProp: 'onPressIn',
    toProp: 'onPressIn',
    dataExtractor: () => {},
  },
  {
    componentTypes: [
      'TouchableHighlight',
      'TouchableWithoutFeedback',
      'TouchableOpacity',
    ],
    fromProp: 'onPressOut',
    toProp: 'onPressOut',
    dataExtractor: () => {},
  },
  {
    componentTypes: [
      'TouchableHighlight',
      'TouchableWithoutFeedback',
      'TouchableOpacity',
    ],
    fromProp: 'onPress',
    toProp: 'onPress',
    dataExtractor: () => {},
  },
]
