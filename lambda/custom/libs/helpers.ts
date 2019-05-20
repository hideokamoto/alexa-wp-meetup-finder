import { getRandomMessage } from 'ask-utils'
import { TEvent } from '../model'
export const getTimezoneByLocale = (locale: string): string => {
  switch(locale) {
    case 'ja-JP':
    case 'ja':
    case 'JP':
    case 'ja_JP':
      return 'Asia/Tokyo'
    default:
      return 'Europe/London'
  }
}

export const getLocation = (event: TEvent): string => {
  const place = event.location.location.split(',')[0]
  return place.replace(/Tōkyō-to/, '東京都')
}

export const getRandomSpeechconTexts = (texts: string[]) => {
  return `<say-as interpret-as="interjection">${getRandomMessage(texts)}</say-as>`
 }