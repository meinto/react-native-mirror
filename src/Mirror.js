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
  }

  static forwardProps = [
    {
      acceptedTypes: [
        'ScrollView',
        'View',
      ],
      from: 'onScroll',
      to: 'scrollTo',
      dataExtractor: event => {
        return {
          y: event.nativeEvent.contentOffset.y,
          x: event.nativeEvent.contentOffset.x,
          animated: false,
        }
      }
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
      Object.keys(_child._owner).map(_key => {
        console.log(_key)
      })
      // console.log('store', _child._owner._renderedComponent)
      console.log('store', _child._owner._topLevelWrapper)
      let clonedElement = _child

      const typeName = type(_child.type) === 'string' ? _child.type : (_child.type) ? _child.type.displayName : false

      if (typeName) {
        let injectedProps = {}

        /* store a reference of every child element */
        const _ref = 'mirror-' + this._refNum++
        
        /* prepare forwards
         * example: { onScroll: { forwardTo: ['scrollTo'], dataExtractor } }
         */
        const forwards = {}
        this.forwardProps.forEach(_forwardConfig => {
          const shouldForward = _forwardConfig.acceptedTypes.includes(typeName)
          if (shouldForward) {
            if (forwards[_forwardConfig.from] === undefined)
              forwards[_forwardConfig.from] = []
            forwards[_forwardConfig.from] = {
              forwardTo: [...forwards[_forwardConfig.from], _forwardConfig.to],
              dataExtractor: _forwardConfig.dataExtractor
            }
          }
        })

        Object.keys(forwards).forEach(_key => {
          const originalProp = _child.props[_key]
          injectedProps[_key] = (...args) => {
            const _args = (args.length > 1) ? args : args[0]
            forwards[_key].forwardTo.forEach(name => {
              this._inject(name, _ref, _args)
            })
            if (type(originalProp) === 'function')
              (args.length > 1) ? originalProp(...args) : originalProp(args[0])
          }

          forwards[_key].forwardTo.forEach(name => {
            this._registerListener(name, _ref, forwards[_key].dataExtractor)
          })
        })

        const children = _child.props.children && this._mapChildren(_child.props.children)

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
    const injectedChildren = this._mapChildren(this.props.children)
    this.setState({
      children: injectedChildren
    })
  }

  _registerListener = (name, ref, dataExtractor) => {
    this.listeners = [...this.listeners, EventRegister.on(name, data => {
      if (data.ref === ref && data.emitter !== this) {
        this._isSlave = true
        if (
          type(data.data) === 'Array' && 
          type(this.references[ref][name]) === 'function'
        ) {
          this.references[ref][name](dataExtractor(...data.data))
        } else {
          this.references[ref][name](dataExtractor(data.data))
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
      {...this._panResponder.panHandlers}
    >{this.state.children}</View>
  }

}


export default Mirror