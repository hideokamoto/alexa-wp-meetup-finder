
import axios from 'axios'
import {TSearchQuery,TReqsponseBody } from '../model'

export default class MeetupFinder {
  private url: string = 'https://api.wordpress.org/events/1.0'
  private query: TSearchQuery = {
    number: 3
  }
  setLocale(locale: string) {
    this.query.locale = locale
    return this
  }
  setTimezone(timezone: string) {
    this.query.timezone = timezone
    return this
  }
  setLocation(location: string) {
    this.query.location = location
    return this
  }
  setLimit(limit: number) {
    this.query.number = limit
    return this
  }
  getSearchQuery() {
    const queries = Object.keys(this.query).map(key => {
      if (!this.query.hasOwnProperty(key)) return ''
      const item = (this.query as any)[key] as string
      if (!item) return ''
      return `${key}=${item}`
    })
    return `?${queries.join('&')}`
  }
  getUrl() {
    const query = this.getSearchQuery()
    return encodeURI([this.url, query].join('/'))
  }
  async get() {
    const url = this.getUrl()
    try {
      const { data } = await axios.get(url)
      return data as TReqsponseBody
    } catch (e) {
      console.log('Fetch Error: %j', e)
      return null
    }
  }
}