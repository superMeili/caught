import { isArray, isNative } from './index'

type SetMap = {
  [key: keyof any]: true
}

class _Set {
  private _setMap: SetMap = Object.create(null)
  constructor(originValue?: any[]) {
    if (!(originValue && isArray(originValue))) return
    originValue && originValue.forEach(key => {
      this.add(key)
    })
  }

  add(key: any) {
    this._setMap[key] = true
  }

  clear() {
    this._setMap = Object.create(null)
  }

  delete(key: any) {
    delete this._setMap[key]
  }

  has(key: any) {
    return !!this._setMap[key]
  }
}

export default isNative(Set) ? Set : _Set