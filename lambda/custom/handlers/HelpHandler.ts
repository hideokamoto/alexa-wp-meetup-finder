import { HandlerInput } from 'ask-sdk-core'
import { Response } from 'ask-sdk-model'
import {
  isHelpIntent
} from 'ask-utils'
import ResponseFactory from '../libs/responseFactory'

export default  {
  canHandle(handlerInput: HandlerInput): boolean {
    return isHelpIntent(handlerInput)
  },
  handle(handlerInput: HandlerInput): Response {
    const builder = ResponseFactory.init()
    builder.putSpeechParagraph('このスキルでは、ワードプレスミートアップのイベントを検索できます。')
      .putSpeechParagraph('東京のイベントを教えて。のように話しかけることで、ミートアップの開催予定を調べます。')
      .putSpeechParagraph('なお、このスキルは、ワードプレス公式とは関係のない非公式スキルですので、ご了承ください。')
      .putSpeechParagraph('どの地域のイベントについて知りたいですか？')
      .putRepromptText('どの地域のイベントについて知りたいですか？')
      .putCardTitle('WordPressイベント検索でできること')
      .putCardContent([
        '# 地名での検索',
        '「大阪のイベントを探して」',
        '「東京のイベント」',
        '',
        '# デバイスに登録された住所での検索',
        '１：「デバイスアドレスを登録」と話しかける',
        '２：アプリからデバイスアドレスの利用を許可する',
        '３：「ワードプレスイベント検索で検索」と話しかける',
        '',
        '# 保存した地域での検索',
        '検索した地域を保存することができます。',
        '保存した後は、「ワードプレスイベント検索で検索」と話しかけるだけで、保存した地域で検索します。'
      ].join('\n'))
    const { speechText, repromptText } = builder.getResponse()
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(repromptText)
      .getResponse();
  },
};