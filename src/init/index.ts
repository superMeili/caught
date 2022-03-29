import { initProxy, initScheduler, initListener } from '../core'
import { createInnerConfig } from '../config/index'
import { initHooks } from '../hook'
import type { Config, Caught } from '../types'

export function createCaught(rawConfig: Config) {
  const caught = Object.create(null) as Caught
  createInnerConfig(caught, rawConfig)
  if (!caught.config) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Please check the configuration for createCaught')
    }
    return
  }
  initHooks(caught)
  initScheduler(caught)
  initListener(caught)
  initProxy(caught)

  return {
    createCustomInsert: caught.createCustomInsert,
    proxyCaught: caught.proxyCaught
  }
}