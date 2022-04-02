import { isFunction, isPlainObject, isNative, hasProto } from '../share'
import type { AnyFunc, ProxyConfig, Caught } from '../types'


function setInternalPropWritable (target: AnyFunc, writable: boolean) {
  Object.defineProperties(target, {
    length: {
      writable
    },
    name: {
      writable
    }
  })
}

function forwardAdditionalPropetry(proxyFunc: AnyFunc, original: AnyFunc) {
  function forwardProp (source: string[] | symbol[]) {
    source.forEach(prop => {
      proxyFunc[prop] = original[prop]
    })
  }
  setInternalPropWritable(proxyFunc, true)
  forwardProp(Object.getOwnPropertyNames(original))
  setInternalPropWritable(proxyFunc, false)
  try {
    if (isNative(Symbol)) {
      forwardProp(Object.getOwnPropertySymbols(original))
    }
  } catch (error) {
    
  }
}

function coverProto(proxyFunc: AnyFunc, original: AnyFunc) {
  proxyFunc.prototype = original.prototype
  if (hasProto) {
    proxyFunc.__proto__ = original.__proto__
  }else {
    const proto = Object.getPrototypeOf(original)
    Object.getOwnPropertyNames(proto).forEach(key => {
      Object.defineProperty(proxyFunc, key, {
        get() {
          return proto[key]
        }
      })
    })
  }
}


export default function proxyCreater (caught: Caught) {
  
  let proxyId = 0

  const scheduler = caught.scheduler

  function proxyCaught<T extends AnyFunc>(rawFunc: T, config: ProxyConfig) {
    if (!isFunction(rawFunc)) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('The first parameter of createCaught must be the function type')
      }
      return rawFunc
    }
    let meta: any
    const isObjectConfig = isPlainObject(config)
    if (isObjectConfig) {
      const others = config.others
      if (others) {
        const _meta = (meta || (meta = {}))
        _meta.proxyCaught = {
          others
        }
      }
    }
    const cProxyId = proxyId++
    const type = 'proxyError'
    const flag = isObjectConfig ? config.flag : config
    const customInsertInfo = scheduler.createCustomInsert(type, flag, cProxyId)
    const proxyFunc = function (this: any, ...args: Parameters<T>) {
      try {
        return rawFunc.apply(this, args)
      } catch (error) {
        if (isPlainObject(config) && config.withArgs) {
          const _meta  = (meta || (meta = {}));
          (_meta.proxyCaught || (_meta.proxyCaught = {})).args = args
        }
        
        const errorInfo = {
          error,
          meta
        }

        customInsertInfo(errorInfo)

        throw error
      }
    }

    coverProto(proxyFunc, rawFunc)
    forwardAdditionalPropetry(proxyFunc, rawFunc)

    return proxyFunc
  }

  return proxyCaught
}

export function initProxy(caught: Caught) {
  caught.proxyCaught = proxyCreater(caught)
}