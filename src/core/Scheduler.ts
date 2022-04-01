import { isArray, createFlag } from '../share'
import { callHook, updateMeta } from '../share/call-hook'
import fireLoop from '../share/fire-loop'
// import Set from '../share/Set'
import type { Info, InfoList, Caught, CaughtScheduler, CustomInfo} from '../types'
import { HookNames } from '../types'

class Scheduler implements  CaughtScheduler {
  // readonly handledFlags = new Set()
  queueCache!: InfoList | null
  queueIndex: number = -1
  cachedFailMap:{ [index: number]: InfoList } = Object.create(null)
  failCount: number = 0
  tickStart: boolean = false
  stop: boolean = false
  constructor(readonly caught: Caught) {
    
  }
  pendingInsertInfo (info: Info, isRetry?: boolean) {
  
    if (this.stop) return

    callHook(this.caught, HookNames.ADDHOOK, [ info ], (meta: any) => {
      updateMeta(info, meta)
    })

    // if (this.handledFlags.has(flag) && !isRetry) return
  
    const pendigQueue = this.createPendingQueue()
  
    if (!isRetry) {
      const sameIndex = this.getSameIndex(pendigQueue, info)
      if (sameIndex > -1) {
        const preInfo = pendigQueue[sameIndex];
        this.combineInfo(preInfo, info)
      }else {
        info.count = 1
        pendigQueue.push(info)
      }
    }
  
    if (!this.tickStart) {
      this.tickStart = true
      fireLoop(() => {
        try {
          this.tickStart = false
          this.queueCache = null
          if (pendigQueue.length) {
            const notify = this.createNotify(pendigQueue, this.queueIndex)
            const errorHandler = this.caught.config.errorHandler
            errorHandler(pendigQueue, notify)
          }
        } catch (error) {
          if (process.env.NODE_ENV !== 'production') {
            console.error('Some errors occurred during error reporting')
          }
        }
      }, this.caught.config.sync)
    }
  }
  createCustomInsert(type: string, flag: string, extra?: any) {
    flag = createFlag(type, flag, extra)
    const _this = this
    return function customInsertInfo (customInfo: CustomInfo) {
      const info = {
        ...customInfo,
        type,
        flag,
        time: +new Date
      }
      _this.pendingInsertInfo(info)
    }
  }
  retryHandler() {
    const hasCachedFailInfos = Object.keys(this.cachedFailMap).length
    hasCachedFailInfos && this.pendingInsertInfo({ flag: '', type: '', error: [], meta: [] }, true)
  }
  private getSameIndex(queue: InfoList, info: Info): number {
    return queue.findIndex(({ flag }) => flag === info.flag)
  }
  private combineInfo(preInfo: Info, info: Info) {
    let count = preInfo.count as number
    if (count >= this.caught.config.sameLimit) return
    preInfo.count = ++count
    preInfo.error = combineArr(preInfo.error, info.error)
    preInfo.meta = combineArr(preInfo.meta, info.meta)
  }
  private createInitQueue(): InfoList {
    const uniqueInfos = [] as InfoList
    for(let index in this.cachedFailMap ) {
      const cq = this.cachedFailMap[index]
      for(let i = 0; i < cq.length; i++) {
        const info = cq[i]
        const sameIndex = this.getSameIndex(uniqueInfos, info)
        if (sameIndex > -1) {
          const preInfo = uniqueInfos[sameIndex];
          this.combineInfo(preInfo, info)
        }else {
          uniqueInfos.push(info)
        }
      }
      delete this.cachedFailMap[index]
    }
    return uniqueInfos
  }
  private createPendingQueue(): InfoList {
    if (this.tickStart) {
      return this.queueCache || []
    }else {
      const pendigQueue = [...this.createInitQueue()] as InfoList
      return (++this.queueIndex, this.queueCache = pendigQueue)
    }
  }
  private createNotify(currentPendigQueue: InfoList, currentIndex: number) {
    function notify (this: Scheduler, result: any) { 
      // Because of the loop of events, 
      // There is no case where an error queue is still pending when a notification is received  
      result = !!result
    
      if (result) { // success
        // for(let i = 0; i < currentPendigQueue.length; i++) {
        //   const flag = currentPendigQueue[i].flag
        //   this.handledFlags.add(flag)
        // }
        // currentPendigQueue.length = 0
        callHook(this.caught, HookNames.SUCCESSHOOK, [ currentPendigQueue, currentIndex ])
      }else { // fail
        this.cachedFailMap[currentIndex] = currentPendigQueue
        this.failCount++

        if (this.failCount >= this.caught.config.failMaxNum) { // out of range ,to stop caught
          this.stop = true
          this.cachedFailMap = Object.create(null)
        }
        
        callHook(this.caught, HookNames.FAILHOOK, [ currentPendigQueue, currentIndex ])
      }
    }

    return notify.bind(this)
  }
}

export default Scheduler

export function initScheduler(caught: Caught) {
  const scheduler = caught.scheduler = new Scheduler(caught)
  const createCustomInsert = caught.createCustomInsert =  scheduler.createCustomInsert.bind(scheduler)
  callHook(caught, HookNames.SCHEDULABLEHOOK, [createCustomInsert])
}

export function initRetry(caught: Caught) {
  const scheduler = caught.scheduler
  const retryTime = caught.config.retryTime
  let timer: number
  timer = window.setInterval(() => {
    if (scheduler.stop) return clearInterval(timer)
    scheduler.retryHandler()
  }, retryTime)
}


function combineArr(father: any, child: any) {
  if (!father) return child
  if (!child) return father
  const isArrC = isArray(child)
  return isArray(father) ? isArrC ? [...father, ...child] : father.push(child) : isArrC ? child.unshift(father) : [father, child]
}
