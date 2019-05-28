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

import ResponseFactory, { IResponseBuilder, IResponseContent } from '../libs/responseFactory'
import MeetupFinder from '../libs/meetupFinder'
import List from '../libs/apl/List'
import ListTemplateMetadataFactory from '../libs/apl/ListMetadata'
import ListItem from '../libs/apl/ListItem'
import { getLocation, getTimezoneByLocale, getRandomSpeechconTexts } from '../libs/helpers'
import { TReqsponseBody } from '../model'

class ContentBuilder {
  private locale: string
  private builder: IResponseBuilder
  constructor(locale: string, builder: IResponseBuilder = ResponseFactory.init()) {
    this.locale = locale
    this.builder = builder
  }
  getProgressComment(): string {
    return getRandomSpeechconTexts([
      'オーケーです',
      'オーケー',
      'オッケー',
      'ラジャー'
    ])
  }
  getFailedToGetEventResponse(): IResponseContent {
    return this.builder.putSpeechParagraph('データの取得に失敗しました。もう一度探したい地域名をお聞かせください。')
      .putRepromptText('他の地域も調べますか？終了する場合は、ストップと話しかけてください。')
      .getResponse()
  }
  getNoEventResponse(region?: string): IResponseContent {
    const preText = region ? `${region}の`: ''
    const builder = this.builder.putSpeechParagraph(`${preText}近くで開催されるイベントが今の所ない様子です・・・。他の地域も調べますか？`)
      .putRepromptText('他の地域も調べますか？終了する場合は、ストップと話しかけてください。')
    if (region) builder.putCardTitle(`${region}のイベント`).putCardContent(`${region}で今後開催予定のWordPress Meetupは今の所ありません。`)
    return builder.getResponse()
  }
  getLocale(): string {
    return this.locale
  }
  getListEventResponse(data: TReqsponseBody): IResponseContent {
    this.builder.putSpeechParagraph(`${data.location.description}の周辺で開催予定のイベントは、 次の${data.events.length}件です。`)
    // APL系処理のセットアップ
    const metadataBuilder = ListTemplateMetadataFactory.init()
    const title = `${data.location.description}周辺のイベント情報`
    metadataBuilder.setTitle(title).setShortTitle(`${data.location.description}周辺`)
    this.builder.putCardTitle(title)
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
      this.builder.putSpeechParagraph(p)
      const number = i + 1
      const Item = new ListItem(number, `event-${number}`)
      Item.setPrimaryText(`${date} ~`)
        .setSecondaryText(event.title)
      directive.putListItem(Item.getItem())
      this.builder.putCardContent(event.title)
        .putCardContent(event.meetup)
        .putCardContent(date + ' ~ ')
        .putCardContent('URL: ' + event.meetup_url)
    })
    this.builder
      .putSpeechParagraph('他の地域も調べますか？')
      .putRepromptText('他の地域も調べますか？終了する場合は、ストップと話しかけてください。')
      .setDirective(directive.getDirective())
    return this.builder.getResponse()
  }
}

export default {
  canHandle(handlerInput: HandlerInput): boolean {
    return isMatchedIntent(handlerInput, 'SearchByRegionIntent')
  },
  async handle(handlerInput: HandlerInput): Promise<Response> {
    const { responseBuilder } = handlerInput
    const locale = getLocale(handlerInput)
    const contentBuilder = new ContentBuilder(locale)
    const inprogressMessage = contentBuilder.getProgressComment()
    await enqueueProgressiveResponse(handlerInput, inprogressMessage)
    const finder = new MeetupFinder()
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