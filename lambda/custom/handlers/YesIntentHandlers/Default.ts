import { RequestHandler } from 'ask-sdk-core';
import {
  isYesIntent,
} from 'ask-utils'

export const YesIntentHandler: RequestHandler = {
  canHandle(handlerInput) {
    return isYesIntent(handlerInput)
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak('調べたい地域の名前を教えてください。東京や京都のように都道府県名で言ってもらえると、見つけやすくて助かります。')
      .reprompt('調べたい地域はどこですか？なければ、「終了」と言ってください。')
      .getResponse()
  }
}
export default YesIntentHandler
