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