import { HandlerInput } from 'ask-sdk-core'
import { Response } from 'ask-sdk-model'
import {
  isLaunchRequest
} from 'ask-utils'
import ResponseFactory from '../libs/responseFactory'

export default  {
  canHandle(handlerInput: HandlerInput): boolean {
    return isLaunchRequest(handlerInput)
  },
  handle(handlerInput: HandlerInput): Response {
    const builder = ResponseFactory.init()
    builder.putSpeechParagraph('ワードプレスイベント検索へようこそ。')
      .putSpeechParagraph('このスキルは、ワードプレスミートアップのイベントを検索できる非公式スキルです。')
      .putSpeechParagraph('東京のイベントを教えて。のように話しかけることで、ミートアップの開催予定を調べます。')
      .putSpeechParagraph('どの地域のイベントについて知りたいですか？')
      .putRepromptText('どの地域のイベントについて知りたいですか？')
    const { speechText, repromptText } = builder.getResponse()
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(repromptText)
      .getResponse();
  },
};