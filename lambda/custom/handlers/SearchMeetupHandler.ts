import { HandlerInput } from 'ask-sdk-core'
import { Response } from 'ask-sdk-model'
import {
  isMatchedIntent,
  getLocale,
  getSlotValue,
  enqueueProgressiveResponse,
  getSupportedInterfaces,
  updateSessionAttributes
} from 'ask-utils'
import moment from 'moment-timezone'
import MeetupFinder from '../libs/meetupFinder'
import { getTimezoneByLocale} from '../libs/helpers'
import ContentBuilder from '../libs/responseBuilder/SearchMeetup'
import {
  SAVE_THE_REGION_NAME
} from '../state'

const trimRegionName = (region?: string): string | null => {
  if (!region) return null
  if (/^東京/.test(region)) return '東京'
  if (/^大阪/.test(region)) return '大阪'
  if (/^京都/.test(region)) return '京都'
  if (/^北海道/.test(region)) return '北海道'
  if (!/県/.test(region)) return region
  const t = region.split('県')
  return `${t[0]}`
}

export default {
  canHandle(handlerInput: HandlerInput): boolean {
    return isMatchedIntent(handlerInput, 'SearchByRegionIntent')
  },
  async handle(handlerInput: HandlerInput, presentedRegion: string = '', isPersisted: boolean = false): Promise<Response> {
    const { responseBuilder } = handlerInput
    // 検索開始のアナウンス（progressive response）
    const locale = getLocale(handlerInput)
    const contentBuilder = new ContentBuilder(locale)
    const inprogressMessage = contentBuilder.getProgressComment()
    await enqueueProgressiveResponse(handlerInput, inprogressMessage)

    // イベント検索
    const finder = new MeetupFinder()
    if (locale) finder.setLocale(locale)
    const region = trimRegionName(presentedRegion || getSlotValue(handlerInput, 'region'))
    if (!region) {
      throw new Error('region is not defined.')
    }
    const timezone = getTimezoneByLocale(locale)
    if (timezone) {
      finder.setTimezone(timezone)
      moment.tz(timezone)
    }
    const data = await finder.setLocation(region).get()


    // データの保存判定
    if (!isPersisted) {
      updateSessionAttributes(handlerInput, {
        state: SAVE_THE_REGION_NAME,
        saveTargetRegion: region
      })
      contentBuilder.shouldAskSaveTheRegion()
    }

    // レスポンスの作成
    if (!data) {
      const failedToGetResponse = contentBuilder.getFailedToGetEventResponse()
      return responseBuilder.speak(failedToGetResponse.speechText)
        .reprompt(failedToGetResponse.repromptText)
        .getResponse()
    }
    if (data.events.length < 1) {
      const noEventResponse = contentBuilder.getNoEventResponse()
      const noEvent = responseBuilder.speak(noEventResponse.speechText)
        .reprompt(noEventResponse.repromptText)
      if (noEventResponse.cardTitle) noEvent.withSimpleCard(noEventResponse.cardTitle, noEventResponse.cardText)
      return noEvent.getResponse()
    }
    updateSessionAttributes(handlerInput, {
      events: data.events
    })
    const { speechText, repromptText, cardText, cardTitle, directive } = contentBuilder.getListEventResponse(data)
    responseBuilder.speak(speechText)
      .reprompt(repromptText)
      .withSimpleCard(cardTitle, cardText)
    const interfaces = getSupportedInterfaces(handlerInput)
    if (directive && interfaces["Alexa.Presentation.APL"]) {
      responseBuilder.addDirective(directive)
    }
    return responseBuilder.getResponse()
  }
}