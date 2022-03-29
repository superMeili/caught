import { isFunction, isObject } from '../share'
import type { Caught, HookNames, ValueOf, CustomInfo } from '../types'

export function callHook(caught: Caught, hookName: ValueOf<typeof HookNames>, args: any[], handler?: (result: any) => void) {
  let i = 0
  let hooks
  try {
    hooks = caught.hooksMap[hookName]
    for (let i = 0; i < hooks.length; i++) {
      const cb = hooks[i]
      if(isFunction(cb)) {
        const r = cb.apply(null, args)
        isFunction(handler) && handler(r)
      }
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(`Some errors occurred while executing ${ hooks?.pluginNameList?.[i] } hooks`)
    }
  }
}

export function updateMeta(originalInfo: CustomInfo, meta: any) {
  const originalMeta = originalInfo.meta?.[0]
  isObject(meta) && (originalInfo.meta = [originalMeta ? {
    ...originalMeta,
    ...meta
  } : meta])
}