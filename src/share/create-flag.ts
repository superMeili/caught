const typeFlagToIndexMap = { } as { [key: string]: number }

export function createFlag (type: string, flag: string, extra?: any) {
  type = String(type)
  flag = String(flag)
  extra = extra ? String(extra) : ''
  
  let rawUniFlag = `${type}-${flag}`
  
  let index = typeFlagToIndexMap[rawUniFlag]
  index = index ? index++ : 0
  typeFlagToIndexMap[flag] = index

  return `${rawUniFlag}-${index}${extra && '-' + extra}` // 

}