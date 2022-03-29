import { isNative, isFunction } from './index'

let pending = true 

const cbs = [] as Function[]
const fireCbs = () => {
  try {
    pending = true
    cbs.forEach(cb => isFunction(cb) && cb())
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error executing callback list')
    }
  } finally {
    cbs.length = 0
  }
}

export default function fireLoop (callback: Function, noWait?: boolean) {
  cbs.push(callback)
  if (noWait) return fireCbs()
  if (pending) {
    pending = false
    console.log('来了老弟')
    if (isNative(Promise)) {
      Promise.resolve().then(fireCbs)
    }else {
      setTimeout(fireCbs)
    }
  }
}