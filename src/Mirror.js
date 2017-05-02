import React, { 
  PureComponent,
  Children,
} from 'react'
import { View } from 'react-native'
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
    },
  ]

  constructor(props) {
    super(props)

    this.forwardProps = [...Mirror.forwardProps, ...this.props.forwardProps]

    this.state = {
      children: null,
    }
  }

  componentWillMount() {
    this._refNum = 0
    this.references = []
    this.listeners = []
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

  _inject = (name, ref, mapTo, data) => {
    EventRegister.emit('onScroll', {
      forwardFuncName,
      data: {
        id: this.props.id,
        ref,
        data,
      }
    })
  }

  _mapChildren = (children) => {
    return Children.map(children, _child => {
      let clonedElement = _child

      const typeName = type(_child.type) === 'string' ? _child.type : (_child.type) ? _child.type.displayName : false

      if (typeName) {
        let injectedProps = {}

        const _ref = 'mirror-' + this._refNum++
        
        const forwards = {}
        this.forwardProps.forEach(_forwardConfig => {
          const shouldForward = _forwardConfig.acceptedTypes.includes(typeName)
          if (shouldForward) {
            if (forwards[_forwardConfig.from] === undefined)
              forwards[_forwardConfig.from] = []
            forwards[_forwardConfig.from] = [...forwards[_forwardConfig.from], _forwardConfig.to]
          }
        })

        Object.keys(forwards).forEach(_key => {
          const originalProp = _child.props[_key]
          injectedProps[_key] = () => {
            args = arguments
            forwards[_key].forEach(name => {
              this._inject(name, _ref, args)
            })
            if (type(originalProp) === 'function')
              (type(args) === 'Array') ? originalProp(...args) : originalProp(args)
          }

          forwards[_key].forEach(name => {
            this._registerListener(name, _ref)
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

  _registerListener = (name, ref) => {
    this.listeners = [...this.listeners, EventRegister.on(name, data => {
      if (data.ref === ref) {
        (type(data.data) === 'Array') ? this.references[ref][name](...data.data) : this.references[ref][name](data.data)
      }
    })]
  }

  _unregisterListeners = () => {
    this.listeners.forEach(_id => {
      EventRegister.rm(_id)
    })
  }

  render() {
    return <View>{this.state.children}</View>
  }

}


export default Mirror