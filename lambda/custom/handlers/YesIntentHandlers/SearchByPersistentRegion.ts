import { RequestHandler } from 'ask-sdk-core';
import {
  isYesIntent,
  getSessionAttributes
} from 'ask-utils'
import {
  SEARCH_BY_PERSISTENT_REGION
} from '../../state'
import SearchMeetupHandler from '../SearchMeetupHandler'

export const YesSearchByPersistentRegionHandler: RequestHandler = {
  canHandle(handlerInput) {
    if (!isYesIntent(handlerInput)) return false
    const {state} = getSessionAttributes(handlerInput)
    return state === SEARCH_BY_PERSISTENT_REGION
  },
  async handle(handlerInput) {
    const { persistentedRegion } = getSessionAttributes(handlerInput)
    if (persistentedRegion) return SearchMeetupHandler.handle(handlerInput, persistentedRegion, true)
    const attributes  = await handlerInput.attributesManager.getPersistentAttributes()
    return SearchMeetupHandler.handle(handlerInput, attributes.persistentedRegion, true)
  }
}
export default YesSearchByPersistentRegionHandler
