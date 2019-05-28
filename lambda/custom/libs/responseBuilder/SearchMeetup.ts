import moment from 'moment-timezone'

import ResponseFactory, { IResponseBuilder, IResponseContent } from '../../libs/responseFactory'
import List from '../../libs/apl/List'
import ListTemplateMetadataFactory from '../../libs/apl/ListMetadata'
import ListItem from '../../libs/apl/ListItem'
import { getLocation, getRandomSpeechconTexts } from '../../libs/helpers'
import { TReqsponseBody } from '../../model'

export default class ContentBuilder {
  private locale: string
  private builder: IResponseBuilder
  private shouldAskSaveRegion: boolean = false
  constructor(locale: string, builder: IResponseBuilder = ResponseFactory.init()) {
    this.locale = locale
    this.builder = builder
  }
  shouldAskSaveTheRegion() {
    this.shouldAskSaveRegion = true
    return this
  }
  getNextActionText(): string {
    if (this.shouldAskSaveRegion) {
      return [
        '今回の検索に使用した地名を保存することができます。',
        '保存すると、次回から地名を言わずにイベントを検索することができます。',
        'もちろん、地名を言うことで他の地域を検索することもできます。',
        '保存しますか？'
      ].join(' ')
    }
    return '他の地域も調べますか？終了する場合は、ストップと話しかけてください。'
  }
  getRepromptText(): string {
    if (this.shouldAskSaveRegion) {
      return [
        '地名を保存しますか？',
        '終了する場合は、ストップと話しかけてください。'
      ].join(' ')
    }
    return '他の地域も調べますか？終了する場合は、ストップと話しかけてください。'
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
      .putRepromptText(this.getRepromptText())
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
      // speechText
      this.builder.putSpeechParagraph(p)
      // Card Content
      this.builder.putCardContent(event.title)
        .putCardContent(event.meetup)
        .putCardContent(date + ' ~ ')
        .putCardContent('URL: ' + event.meetup_url)
      // APL Content
      const number = i + 1
      const Item = new ListItem(number, `event-${number}`)
      directive.putListItem(
        Item.setPrimaryText(`${date} ~`)
          .setSecondaryText(event.title)
          .getItem()
      )
    })
    this.builder
      .putSpeechParagraph(this.getNextActionText())
      .putRepromptText(`${this.getNextActionText()}終了する場合は、ストップと話しかけてください。`)
      .setDirective(directive.getDirective())
    return this.builder.getResponse()
  }
}