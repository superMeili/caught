import { ValueOf } from '../types'

export * from './create-flag'

export function createOnceHandler(fn: Function) {
  let done = false, result: any
  return function (this: any, ...args: any[]) {
    if (!done) {
      result = isFunction(fn) && fn.apply(this, args)
      done = true
    }
    return result
  }
}

export function toRawType (val: unknown) {
  return Object.prototype.toString.call(val).slice(8, -1)
}
export const hasProto = '__proto__' in {}
export const noop = () => {}

export const isString = (val: unknown): val is string => typeof val === 'string'
export const isBoolean = (val: unknown): val is boolean => typeof val === 'boolean'
export const isObject = (val: unknown): val is Record<any, any> => val !== null && typeof val === 'object'
export const isPlainObject = (val: unknown): val is object => toRawType(val) === 'object'
export const isFunction = (val: unknown): val is Function => typeof val === 'function'
export const isArray = (val: unknown): val is any[] => Array.isArray(val)
export const isNative = (Ctor: Function) => typeof Ctor === 'function' && /native code/.test(Ctor.toString())

export const getObjectValues = <T extends object>(obj: T) => {
  type Value = ValueOf<T>
  const val: Value[] = []
  for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj,key)) {
          val.push(obj[key as keyof T])
      }
  }
  return val;
}