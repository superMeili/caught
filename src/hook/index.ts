import { isArray, getObjectValues } from '../share'
import { HookNames } from '../types'
import type { Caught, Hook, HooksMap, Register } from '../types'


export function createHooksMap(): HooksMap {
  const hooksMap = Object.create(null)
  getObjectValues(HookNames).forEach(key=>{
    hooksMap[key] = []
  })
  return hooksMap
}

export function createHookRegister(hm: HooksMap): Register {
  const register = Object.create(null)
  getObjectValues(HookNames).forEach(key=>{
    register[key] = function (pluginName:string, hook: Hook) {
      const hookArray = hm[key as HookNames]
      const pluginNameList = hookArray.pluginNameList || (hookArray.pluginNameList = [])
      if (pluginNameList.indexOf(pluginName) === -1) {
        hookArray.push(hook)
        pluginNameList.push(pluginName)
      }
    }
  })
  return register 
}

export function initHooks(caught: Caught) {
  const hooksMap = caught.hooksMap = createHooksMap()
  const plugins = caught.config.plugins
  if (!isArray(plugins)) return
  const register = createHookRegister(hooksMap)
  plugins.forEach(pluginInstance => {
    pluginInstance.apply(register)
  })
}
