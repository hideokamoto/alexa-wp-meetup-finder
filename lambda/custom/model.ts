export interface TEventLocation {
  location: string
  country: string
  latitude: number
  longitude: number
}
export interface TEvent {
  type: string
  title: string
  meetup: string
  meetup_url: string
  url: string
  date: string
  location: TEventLocation
}
export interface TRequestLocation {
  description: string
  country: string
  latitude: number
  longitude: number
}
export interface TSearchQuery {
  locale?: string
  timezone?: string
  number: number
  location?: string
}
export type TEvents = TEvent[]
export type TReqsponseBody = {
  location: TRequestLocation,
  events: TEvents
}
export interface TListTemplateItem {
  listItemIdentifier: string
  ordinalNumber: number
  textContent: {
      primaryText: string
      secondaryText: string
      tertiaryText?: string
  },
  token: string
}
export type TEventDetail = {
  title: string
  start: number
  end?: number
  description: string
  venue: {
    name: string
    address: string
    capacity?: number
    lat?: number
    long?: number
  }
  how_to_find_us?: string
}