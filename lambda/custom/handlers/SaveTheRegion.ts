import { RequestHandler } from 'ask-sdk-core';
import {
  isMatchedIntent,
  getSessionAttribute,
  updateSessionAttributes
} from 'ask-utils'
import {
  ASK_NEXT_REGION
} from '../state'

export const SaveTheTownHandler: RequestHandler = {
  canHandle(handlerInput) {
    return isMatchedIntent(handlerInput, 'SaveTheTownIntent')
  },
  async handle(handlerInput) {
    updateSessionAttributes(handlerInput, {
      state: ASK_NEXT_REGION
    })
    const region = getSessionAttribute(handlerInput, 'saveTargetRegion')
    if (!region) {
      return handlerInput.responseBuilder
      .speak('地域名が見つかりませんでした。もう一度、「京都のイベント。」のように話しかけて検索してみて下さい。')
      .reprompt('調べたい地域はどこですか？なければ、「終了」と言ってください。')
      .getResponse()
    }
    handlerInput.attributesManager.setPersistentAttributes({
      persistentedRegion: region
    })
    await handlerInput.attributesManager.savePersistentAttributes()
    return handlerInput.responseBuilder
      .speak('このデバイスで検索する地域名を設定しました。次回から地名を省略して検索できます。それではまた。')
      .getResponse()
  }
}
export default SaveTheTownHandler
