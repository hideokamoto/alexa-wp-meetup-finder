import { RequestHandler } from 'ask-sdk-core';
import {
  isYesIntent,
  getSessionAttributes
} from 'ask-utils'
import {
  SAVE_THE_REGION_NAME
} from '../../state'
import handler from '../SaveTheRegion'

export const YesSaveTheTownHandler: RequestHandler = {
  canHandle(handlerInput) {
    if (!isYesIntent(handlerInput)) return false
    const { state } = getSessionAttributes(handlerInput)
    return state === SAVE_THE_REGION_NAME
  },
  handle(handlerInput) {
    return handler.handle(handlerInput)
  }
}
export default YesSaveTheTownHandler
