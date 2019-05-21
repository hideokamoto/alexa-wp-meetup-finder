import { HandlerInput } from 'ask-sdk-core'
import { Response } from 'ask-sdk-model'
import {
  isMatchedIntent,
  getLocale,
  getSlotValue,
  enqueueProgressiveResponse,
  getSupportedInterfaces
} from 'ask-utils'
import moment from 'moment-timezone'

import ResponseFactory from '../libs/responseFactory'
import MeetupFinder from '../libs/meetupFinder'
import List from '../libs/apl/List'
import ListTemplateMetadataFactory from '../libs/apl/ListMetadata'
import ListItem from '../libs/apl/ListItem'
import { getLocation, getTimezoneByLocale, getRandomSpeechconTexts } from '../libs/helpers'

export default {
  canHandle(handlerInput: HandlerInput): boolean {
    return isMatchedIntent(handlerInput, 'SearchByRegionIntent')
  },
  async handle(handlerInput: HandlerInput): Promise<Response> {
    const { responseBuilder } = handlerInput
    const builder = ResponseFactory.init()
    await enqueueProgressiveResponse(handlerInput, getRandomSpeechconTexts([
      'オーケーです',
      'オーケー',
      'オッケー',
      'ラジャー'
    ]))
    const finder = new MeetupFinder()
    const locale = getLocale(handlerInput)
    if (locale) finder.setLocale(locale)
    const region = getSlotValue(handlerInput, 'region')
    if (!region) {
      throw new Error('region is not defined.')
    }
    const timezone = getTimezoneByLocale(locale)
    if (timezone) {
      finder.setTimezone(timezone)
      moment.tz(timezone)
    }
    const data = await finder.setLocation(region).get()
    if (!data) {
      return responseBuilder.speak('データの取得に失敗しました。もう一度探したい地域名をお聞かせください。')
        .reprompt('他の地域も調べますか？終了する場合は、ストップと話しかけてください。')
        .getResponse()
    }
    if (data.events.length < 1) {
      return responseBuilder.speak('近くで開催されるイベントが今の所ない様子です・・・。他の地域も調べますか？')
        .reprompt('他の地域も調べますか？終了する場合は、ストップと話しかけてください。')
        .getResponse()
    }
    builder.putSpeechParagraph(`${data.location.description}の周辺で開催予定のイベントは、 次の${data.events.length}件です。`)
    // APL系処理のセットアップ
    const metadataBuilder = ListTemplateMetadataFactory.init()
    const title = `${data.location.description}周辺のイベント情報`
    metadataBuilder.setTitle(title)
    builder.putCardTitle(title)
    const directive = new List(metadataBuilder)

    data.events.forEach((event, i) => {
      const place = getLocation(event)
      const date = moment(event.date).format('YYYY/MM/DD H時')
      const p = [
        `${place}で`,
        `${date}に`,
        `${event.title.replace(/Meetup/ig, 'ミートアップ')}`,
        'が開催されます。'
      ].join('、')
      builder.putSpeechParagraph(p)
      const number = i + 1
      const Item = new ListItem(number, `event-${number}`)
      Item.setPrimaryText(`${date} ~`)
        .setSecondaryText(event.title)
      directive.putListItem(Item.getItem())
      builder.putCardContent(event.title)
        .putCardContent(event.meetup)
        .putCardContent(date + ' ~ ')
        .putCardContent('URL: ' + event.meetup_url)
    })
    builder
      .putSpeechParagraph('他の地域も調べますか？')
      .putRepromptText('他の地域も調べますか？終了する場合は、ストップと話しかけてください。')
    const { speechText, repromptText, cardText, cardTitle } = builder.getResponse()
    responseBuilder.speak(speechText)
      .reprompt(repromptText)
      .withSimpleCard(cardTitle, cardText)
    const interfaces = getSupportedInterfaces(handlerInput)
    if (interfaces["Alexa.Presentation.APL"]) {
      responseBuilder.addDirective(directive.getDirective())
    }
    return responseBuilder.getResponse()
  }
}