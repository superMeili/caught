import { isFunction, isBoolean, isPlainObject, isArray } from '../share'
import type { Caught, Config } from '../types'

const defaultRetryTime = 5000
const defaultFailMaxNum = 5
const defaultSameLimit = 10

function createConfig(config: Config) {
  return {
    ...config
  }
}


function verifyConfig(rawConfig: Config): boolean {
  const { errorHandler } = rawConfig
  if (!isFunction(errorHandler)) return false
  return true
}

function normalizeConfig(rawConfig: Config): Config {
  const {sameLimit, retryTime, failMaxNum, listeners, errorHandler, plugins = [] } = rawConfig
  
  return {
    sameLimit: Number(sameLimit) || defaultSameLimit,
    retry: setBooleanValue(rawConfig, 'retry', true),
    retryTime: Number(retryTime) || defaultRetryTime,
    failMaxNum: Number(failMaxNum) || defaultFailMaxNum,
    listeners: normalizeListenerConfig(listeners, rawConfig),
    errorHandler,
    plugins: isArray(plugins) ? plugins : [],
    sync: setBooleanValue(rawConfig, 'retry', false)
  }
}

function normalizeListenerConfig(listeners: Config['listeners'], rawConfig: Config)  {
  if (!('listeners' in rawConfig))  return true
  if (!isPlainObject(listeners)) return isBoolean(listeners) ? listeners : !!listeners
  return {
    jsError: setBooleanValue(listeners, 'jsError', true),
    staticError: setBooleanValue(listeners, 'staticError', true),
    promiseRection: setBooleanValue(listeners, 'promiseRection', true),
  }
}

function setBooleanValue(nest: Record<any, any>, key: string, defaultVal: any) {
  const val = nest[key]
  return key in nest ? isBoolean(val) ? val : !!val : defaultVal
}

export function createInnerConfig(caught: Caught, rawConfig: Config) {
  if (verifyConfig(rawConfig)) {
    const normalized = normalizeConfig(rawConfig)
    return caught.config = createConfig(normalized)
  }
}
