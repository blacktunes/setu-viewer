type Size = 'mini' | 'thumb' | 'small' | 'regular' | 'original'

export interface ApiRes {
  pid: number
  p: number
  uid: number
  title: string
  author: string
  r18: boolean
  width: number
  height: number
  tags: string[]
  ext: string
  uploadDate: number
  urls: {
    [key in Size]: string
  }
  realHeight?: number
}

export type ReqQuery = Partial<{
  r18: number
  num: number
  uid: number | number[]
  keyword: string
  tag: string[]
  size: Size[]
  proxy: string
  dateAfter: number
  dateBefore: number
}>
