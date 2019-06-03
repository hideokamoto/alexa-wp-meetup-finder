import { HandlerInput } from 'ask-sdk-core'
import { Response } from 'ask-sdk-model'
import {
  isLaunchRequest,
  updateSessionAttributes,
  enqueueProgressiveResponse
} from 'ask-utils'
import ResponseFactory from '../libs/responseFactory'
import {
  SEARCH_BY_PERSISTENT_REGION
} from '../state'

export default  {
  canHandle(handlerInput: HandlerInput): boolean {
    return isLaunchRequest(handlerInput)
  },
  async handle(handlerInput: HandlerInput): Promise<Response> {
    const { attributesManager } = handlerInput
    await enqueueProgressiveResponse(handlerInput, 'ワードプレスイベント検索へようこそ。')

    const builder = ResponseFactory.init()
    try {
      const { persistentedRegion } = await attributesManager.getPersistentAttributes()
      if (!persistentedRegion) throw new Error('no db items')
      updateSessionAttributes(handlerInput, {
        persistentedRegion,
        state: SEARCH_BY_PERSISTENT_REGION,
      })
      builder.putSpeechParagraph(`前に${persistentedRegion}で検索されていますが、もう一度検索しますか？`)
        .putRepromptText(`${persistentedRegion}で検索しますか？他の地域で検索する場合は、「東京で検索」のように話しかけてください。`)
    } catch (e) {
      if (e.message !== 'no db items') console.log('[attributesManager.getPersistentAttributes] %j', e)
      builder.putSpeechParagraph('このスキルは、ワードプレスミートアップのイベントを検索できる非公式スキルです。')
        .putSpeechParagraph('東京のイベントを教えて。のように話しかけることで、ミートアップの開催予定を調べます。')
        .putSpeechParagraph('どの地域のイベントについて知りたいですか？')
        .putRepromptText('どの地域のイベントについて知りたいですか？')
    }
    const { speechText, repromptText } = builder.getResponse()
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(repromptText)
      .getResponse();
  },
};