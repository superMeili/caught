import { isBoolean } from '../share'
import { callHook, updateMeta } from '../share/call-hook'
import type { Config, Caught } from '../types'
import { HookNames } from '../types'

function setJsErrorEvent(caught: Caught) {
  const scheduler = caught.scheduler
  const customInsertInfo = scheduler.createCustomInsert('jsError', 'emergency')
  window.addEventListener('error', function(e) {
    const { message, filename, lineno, colno, error } = e
    const jsErrorInfo = {
      error,
      message,
      filename, 
      lineno,
      colno
    }
    callHook(caught, HookNames.JSERRORHOOK, [ jsErrorInfo, e ], (meta: any) => {
      updateMeta(jsErrorInfo, meta)
    })
    customInsertInfo(jsErrorInfo)
  })
}

function setStaticErrorEvent(caught: Caught) {
  const scheduler = caught.scheduler
  const customInsertInfo = scheduler.createCustomInsert('staticError', 'staticResource')
  window.addEventListener('error', function(e){
    const target = e.target as any
    if (target !== window) {
      const resourceUrl = target.href || target.src
      const staticErrorInfo = {
        error: `url: ${ resourceUrl } is fail to load`,
        meta: {
          targetName: target.localName,
          resourceUrl
        },
      }
      callHook(caught, HookNames.STATICERRORHOOK, [ staticErrorInfo, e ], (meta: any) => {
        updateMeta(staticErrorInfo, meta)
      })
      customInsertInfo(staticErrorInfo)
    }
  }, true)
}

function setPromiseRectionEvent(caught: Caught) {
  const scheduler = caught.scheduler
  const customInsertInfo = scheduler.createCustomInsert('promiseRection', 'uncaughtPromise')
  window.addEventListener('unhandledrejection', function(e){
    const promiseRectionInfo = {
      error: (e.reason && e.reason.msg) || e.reason || ''
    }
    callHook(caught, HookNames.PROMISERECTIONHOOK, [ promiseRectionInfo, e ], (meta: any) => {
      updateMeta(promiseRectionInfo, meta)
    })
    customInsertInfo(promiseRectionInfo)
  })
}

export function initListener(caught: Caught) {
  const { jsError, staticError, promiseRection } = getListerSwitch(caught.config.listeners)
  jsError && setJsErrorEvent(caught)
  staticError && setStaticErrorEvent(caught)
  promiseRection && setPromiseRectionEvent(caught)
}

function getListerSwitch(listeners: Config['listeners']) {
  return isBoolean(listeners) ? {
    jsError: listeners,
    staticError: listeners,
    promiseRection: listeners
  } : listeners
}

