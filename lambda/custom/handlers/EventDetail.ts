import {RequestHandler, escapeXmlCharacters, HandlerInput } from 'ask-sdk-core';
import { Response, interfaces, Request } from 'ask-sdk-model'
import moment from 'moment-timezone'
import {
  isMatchedIntent,
  getSlotValue,
  getSupportedInterfaces
} from 'ask-utils'
import { EventDetailFinder} from '../libs/eventDetailFinder'
import ResponseFactory from '../libs/responseFactory'
import { TEvent } from '../model'

/**
 * HTMLタグを文字列から除去する
 * 第二引数にHTMLタグを指定した場合、指定されたHTMLタグは除去されずに残る
 * 
 * @param      {string}       str            処理対象の文字列
 * @param      {string|Array} arrowTag       許容するHTMLタグ名。配列形式で複数指定可能。
 * @return     {string}       タグが除去された文字列
 * @link https://qiita.com/mythrnr/items/a203b6f01ff7fe714312
 */
const removeTag = (str: string, arrowTag: string | string[]): string => {
  // 配列形式の場合は'|'で結合
  if ((Array.isArray ?
      Array.isArray(arrowTag)
      : Object.prototype.toString.call(arrowTag) === '[object Array]')
  ) {
      arrowTag = (arrowTag as string[]).join('|');
  }

  // arrowTag が空の場合は全てのHTMLタグを除去する
  arrowTag = arrowTag ? arrowTag : '';

  // パターンを動的に生成
  var pattern = new RegExp('(?!<\\/?(' + arrowTag + ')(>|\\s[^>]*>))<("[^"]*"|\\\'[^\\\']*\\\'|[^\\\'">])*>', 'gim');

  return str.replace(pattern, '');
}

const getResponse = async (handlerInput: HandlerInput, event?: TEvent): Promise<Response> => {
  const { responseBuilder } = handlerInput
  if (!event) {
    return responseBuilder
      .speak('すみません。イベントが見つかりませんでした。どの地域のイベントを探しますか？')
      .reprompt('どの地域のイベントを探しますか？もう一度話しかけてくれると嬉しいです。')
      .getResponse();
  }
  const client = new EventDetailFinder()
  const data = await client.getDetail(event)
  console.log('EventDetail: %j', data)
  if (!data) {
    return responseBuilder
      .speak('すみません。イベントが見つかりませんでした。どの地域のイベントを探しますか？')
      .reprompt('どの地域のイベントを探しますか？もう一度話しかけてくれると嬉しいです。')
      .getResponse();
  }
  const viewContent = data.description
    .replace(/<br>/ig, '\n')
    .replace(/<br \/>/ig, '\n')
    .replace(/<br\/>/ig, '\n')
    .replace(/<\/p>/ig, '\n')
    .replace(/<("[^"]*"|'[^']*'|[^'">])*>/g,'')
  const builder = ResponseFactory.init()
  const start = moment(data.start).format(event.type === 'meetup' ? 'YYYY/MM/DD H時': 'YYYY/MM/DD')
  const { speechText, repromptText, cardText, cardTitle } = builder
    .putSpeechParagraph(`${data.title.replace(/Meetup/ig, 'ミートアップ')}は、${start}に、${data.venue.name}で開催されます。`)
    .putSpeechParagraph('タイムテーブルなどについてはスキルカードまたは画面に表示しています。')
    .putSpeechParagraph('他に調べたい地域はありますか？')
    .putCardTitle(data.title)
    .putCardContent(`${start}開始。`)
    .putCardContent(viewContent)
    .putRepromptText('他に調べたい地域はありますか？')
    .getResponse()
  responseBuilder
    .speak(speechText)
    .reprompt(repromptText)
    .withSimpleCard(cardTitle, cardText)
  const interfaces = getSupportedInterfaces(handlerInput)
  if (interfaces["Alexa.Presentation.APL"]) {
    const content = removeTag(
      escapeXmlCharacters(data.description)
        .replace(/&lt;\/p&gt;/ig, '<br><br>')
        .replace(/&lt;/ig, '<')
        .replace(/&gt;/ig, '>')
        .replace(/<br\/>/ig, '<br>')
        .replace(/<br \/>/ig, '<br>'),
      ['br', 'strong', 'b', 'em', 'i', 'strike', 'u', 'tt', 'code', 'sub', 'sup']
    )
    responseBuilder.addDirective({
      type: 'Alexa.Presentation.APL.RenderDocument',
      token: 'token',
      document: require('../templates/detail.json'),
      datasources: {
        bodyTemplate1Data: {
          type: "object",
          objectId: "bt1Sample",
          title: "イベント詳細",
          textContent: {
            title: escapeXmlCharacters(data.title.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g,'')),
            primaryText: [
              `会場: ${data.venue.name}`,
              `開催日： ${start}`,
              '<br/>',
              content
            ].join('<br>')
          },
        logoUrl: ""
      }
      }
    })
  }
  return responseBuilder.getResponse()
}

const isAPLTouchEvent = (request: Request): request is interfaces.alexa.presentation.apl.UserEvent => {
  return ((request.type === 'Alexa.Presentation.APL.UserEvent' &&
        (request.source.handler === 'Press' || 
        request.source.handler === 'onPress')))
}
export const EventDetailUserEventIntentHandler: RequestHandler = {
  canHandle(handlerInput) {
    const {request} = handlerInput.requestEnvelope
    if (!isAPLTouchEvent(request)) return false
    if (!request.arguments || request.arguments.length < 0) return false
    return request.arguments[0] === 'SelectEvent'
  },
  async handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request as interfaces.alexa.presentation.apl.UserEvent
    if (!request.arguments || request.arguments.length < 0) throw new Error('Invalid user action')
    const eventNo = request.arguments[1]
    const { events } = handlerInput.attributesManager.getSessionAttributes()
    const event = events[eventNo - 1]
    return getResponse(handlerInput, event)
  }
}
export const EventDetailBySlotIntentHandler: RequestHandler = {
  canHandle(handlerInput) {
    return isMatchedIntent(handlerInput, 'EventDetailIntent')
  },
  async handle(handlerInput) {
    const eventNo = Number(getSlotValue(handlerInput, 'eventNo'))
    const { events } = handlerInput.attributesManager.getSessionAttributes()
    const event = events[eventNo - 1]
    return getResponse(handlerInput, event)
  }
}