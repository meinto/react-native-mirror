import React, { 
  PureComponent,
  Children,
} from 'react'
import { 
  View,
  PanResponder,
} from 'react-native'
import type from 'type-detect'
import { EventRegister } from 'react-native-event-listeners'


class Mirror extends PureComponent {

  static defaultProps = {
    id: 'mirror',
    forwardProps: [],
    _isRootMirror: true,
  }

  static forwardProps = [
    {
      acceptedTypes: [
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
      }
    },
    {
      acceptedTypes: [
        'TouchableHighlight',
        'TouchableWithoutFeedback',
      ],
      fromProp: 'onPressIn',
      toProp: 'onPressIn',
      dataExtractor: () => {}
    },
    {
      acceptedTypes: [
        'TouchableHighlight',
        'TouchableWithoutFeedback',
      ],
      fromProp: 'onPressOut',
      toProp: 'onPressOut',
      dataExtractor: () => {}
    },
  ]

  constructor(props) {
    super(props)

    this.forwardProps = [...Mirror.forwardProps, ...this.props.forwardProps]
    this._isSlave = true

    this.state = {
      children: null,
    }
  }

  componentWillMount() {
    this._refNum = 0
    this.references = []
    this.listeners = []
    // this._prepareChildren()

    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => {
        this._isSlave = false
        return true
      },
    })

    this._panHandlers = this._panResponder.panHandlers
  }

  componentDidMount() {
    this._prepareChildren()
  }

  componentWillUnmount() {
    this._unregisterListeners()
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.children !== undefined) {
      this._unregisterListeners()
      this._prepareChildren()
    }
  }

  _inject = (name, ref, data) => {
    if (!this._isSlave) {
      EventRegister.emit(name, {
        emitter: this,
        id: this.props.id,
        ref,
        data,
      })
    }
  }

  _mapChildren = (children) => {
    return Children.map(children, _child => {
      let clonedElement = _child
      
      if (clonedElement.props && clonedElement.props.mirrorChildren === true) {

        /* inheritance inversion to inject child tree of component */
        const ClassToExtend = _child.type
        class InjectChildTree extends ClassToExtend {
          render() {
            return (
              <Mirror
                _isRootMirror={false}
              >
                {super.render()}
              </Mirror>
            )
          }
        }

        clonedElement = <InjectChildTree />

      } else {

        const typeName = type(_child.type) === 'string' ? _child.type : (_child.type) ? _child.type.displayName : false

        if (typeName) {
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
          this.forwardProps.forEach(_forwardConfig => {
            const shouldForward = _forwardConfig.acceptedTypes.includes(typeName)
            if (shouldForward) {
              if (forwards[_forwardConfig.fromProp] === undefined)
                forwards[_forwardConfig.fromProp] = []
              forwards[_forwardConfig.fromProp] = {
                forwardToInstance: [...forwards[_forwardConfig.fromProp], _forwardConfig.toInstance],
                forwardToProp: [...forwards[_forwardConfig.fromProp], _forwardConfig.toProp],
                dataExtractor: _forwardConfig.dataExtractor
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

          let children = _child.props.children && this._mapChildren(_child.props.children)
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
      }

      return clonedElement
    })
  }

  _prepareChildren = () => {
    const injectedChildren = this._mapChildren(this.props.children)
    this.setState({
      children: injectedChildren
    })
  }

  _registerInstanceListener(name, ref, dataExtractor) {
    this._registerListener(name, ref, dataExtractor, false)
  }

  _registerPropertyListener(name, ref, dataExtractor) {
    this._registerListener(name, ref, dataExtractor, true)
  }

  _registerListener = (name, ref, dataExtractor, isProperty) => {
    this.listeners = [...this.listeners, EventRegister.on(name, data => {
      if (data.ref === ref && data.emitter !== this) {
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
    this.listeners.forEach(_id => {
      EventRegister.rm(_id)
    })
  }

  render() {
    return <View
      onStartShouldSetResponderCapture={() => {
        this._isSlave = false
        return false
      }}
    >{this.state.children}</View>
  }

}


export default Mirror