export interface AnyFunc {
  (...args: any[]): any
  [key: keyof any]: any
}


export type ValueOf<T> = T[keyof T];


export interface Meta {
  [key: keyof any]: any
}

export interface Info {
  type: string
  flag: string
  meta?: Meta | Meta[]
  count?: number
  error?: any
  message?: string
  filename?: string
  lineno?: number
  colno?: number
  time?: number
}

export class InfoList extends Array<Info> {
  __waiting__?: boolean
}

export type CustomInfo = Pick<Info, Exclude<keyof Info, 'type' | 'flag'>>

export interface Config {
  sameLimit: number,
  retry: boolean,
  retryTime: number,
  failMaxNum: number,
  listeners: boolean | {
    jsError: boolean,
    staticError: boolean,
    promiseRection: boolean
  }
  errorHandler: ErrorHandler,
  plugins?: Plugin[],
  sync: boolean,
}

export interface ErrorHandler {
  (info: InfoList, notify: (result: any) => void): any
}

export interface Plugin {
  apply(register: Register): void
}

export enum HookNames {
  ADDHOOK = 'addInfo',
  SUCCESSHOOK = 'success',
  FAILHOOK = 'fail',
  SCHEDULABLEHOOK= 'schedulable',
  JSERRORHOOK = 'jsError',
  STATICERRORHOOK = 'staticError',
  PROMISERECTIONHOOK = 'promiseRejection'
}

export type HookType = {
  [HookNames.ADDHOOK]: (info?: Info) => Meta | void
  [HookNames.JSERRORHOOK]: (info?: Info, e?: Event) => Meta | void
  [HookNames.STATICERRORHOOK]: (info?: Info, e?: Event) => Meta | void
  [HookNames.PROMISERECTIONHOOK]: (info?: Info, e?: Event) => Meta | void
  [HookNames.SUCCESSHOOK]: (InfoList?: InfoList, index?: number) => void
  [HookNames.FAILHOOK]: (InfoList?: InfoList, index?: number) => void
  [HookNames.SCHEDULABLEHOOK]: (createCustomInsert?: CreateCustomInsert) => void
}

export class HookArray<T> extends Array<T> {
  pluginNameList?: string[]
}

export type HooksMap = {
  [key in HookNames]: HookArray<HookType[key]>
}

export type Register = {
  [key in HookNames]: (pluginName: string, hook: HookType[key]) => void
}

export interface CreateCustomInsert {
  (type: string, flag: string, extra?: any): (info: CustomInfo) => void
}

export interface CaughtScheduler {
  pendingInsertInfo(info: Info): void
  createCustomInsert: CreateCustomInsert
  retryHandler(): void
  stop: boolean
}

export type ProxyConfig = {
  flag: any,
  withArgs?: boolean,
  others?: any,
} | string

export interface ProxyCaught {
  <T extends AnyFunc>(rawFunc: T, config: ProxyConfig): (this: any, ...args: Parameters<T>) => any
}

export interface Caught {
  config: Config
  hooksMap: HooksMap
  scheduler: CaughtScheduler
  createCustomInsert: CreateCustomInsert
  proxyCaught: ProxyCaught
}
