
import axios from 'axios'
import { TEvent, TEventDetail } from '../model'

export class EventDetailFinder {
  private async get(url: string, params: any = {}) {
    const { data } = await axios.get(url, { params })
    return data
  }
  async getFromMeetup(url: string): Promise<TEventDetail  | null>  {
    const t = url.split('https://www.meetup.com/')[1]
    if (!t) throw new Error('no meetup.com event')
    const [
      groupUrlName,
      eventId
    ] = t.split('/events/')
    if (!groupUrlName) throw new Error('no group name')
    const data = await this.get(`https://api.meetup.com/${groupUrlName}/events/${eventId}`)
    if (!data) return null
    return {
      title: data.name,
      start: data.time,
      description: data.description,
      venue: {
        name: data.venue.name,
        address: data.venue.address_1,
        lat: data.venue.lat,
        long: data.venue.lon,
        capacity: data.rsvp_limit
      },
      how_to_find_us: data.how_to_find_us
    }
  }
  async getFromWordCamp(title: string): Promise<TEventDetail  | null> {
    const url = 'https://central.wordcamp.org/wp-json/wp/v2/wordcamps'
    const events = await this.get(url, {search: title})
    if (!events || events.length < 1) return null
    const event = events[0]
    return {
      title: event.title.rendered,
      start: Number(event['Start Date (YYYY-mm-dd)']) * 1000,
      end: Number(event['End Date (YYYY-mm-dd)']) * 1000,
      description: event.content.rendered,
      venue: {
        name: event['Venue Name'],
        address: event['Physical Address'],
        capacity: Number(event['Maximum Capacity']),
        lat: event._venue_coordinates.latitude,
        long: event._venue_coordinates.longitude
      }
    }
  }
  async getDetail(event: TEvent): Promise<TEventDetail  | null> {
    if (event.type === 'wordcamp') return this.getFromWordCamp(event.title)
    if (event.type === 'meetup') return this.getFromMeetup(event.url)
    throw new Error('un supported event type')
  }
}