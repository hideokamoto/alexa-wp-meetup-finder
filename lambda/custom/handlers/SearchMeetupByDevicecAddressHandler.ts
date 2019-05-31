import { HandlerInput, getDeviceId, getApiAccessToken } from 'ask-sdk-core'
import { Response ,services, RequestEnvelope} from 'ask-sdk-model'
import {
  isMatchedIntent,
  getSessionAttributes,
  updateSessionAttributes
} from 'ask-utils'
import SearchMeetupHandler from './SearchMeetupHandler'
import {
  ASK_NEXT_REGION
} from '../state'

const getSearchQuery = (address: services.deviceAddress.Address): string => {
  if (!address) return ''
  if (address.city) return address.city
  if (address.stateOrRegion) return address.stateOrRegion
  return ''
}
const fallbackText = '地名で検索する場合は、そのまま「東京のイベント。」のように話しかけてください。地名で検索しますか？'

const geteviceAddress = async (requestEnvelope: RequestEnvelope, serviceClientFactory: services.ServiceClientFactory): Promise<string> => {
  try {
    const client = serviceClientFactory.getDeviceAddressServiceClient()
    const address = await client.getFullAddress(getDeviceId(requestEnvelope))
    console.log('geteviceAddress :%j', {
      city: address.city,
      stateOrRegion: address.stateOrRegion
    })
    const region = getSearchQuery(address)
    console.log('getSearchQuery :%j', address)
    return region
  } catch (e) {
    console.log(e)
    return ''
  }
}
export default {
  canHandle(handlerInput: HandlerInput): boolean {
    return isMatchedIntent(handlerInput, 'SearchByDeviceAddressIntent')
  },
  async handle(handlerInput: HandlerInput): Promise<Response> {
    updateSessionAttributes(handlerInput, {
      state: ASK_NEXT_REGION,
    })
    const { responseBuilder, serviceClientFactory, requestEnvelope, attributesManager } = handlerInput
    // 保存している地名があるなら、そっちで検索する。
    try {
      const { persistentedRegion } = await attributesManager.getPersistentAttributes()
      if (persistentedRegion) {
        return SearchMeetupHandler.handle(handlerInput, persistentedRegion, true)
      }
    } catch (e) {
      console.log('[attributesManager.getPersistentAttributes] %j', e)
    }
    // device address api未対応
    if (!serviceClientFactory) {
      return responseBuilder.speak(`お使いのデバイスでは、登録された住所から検索することができませんでした。${fallbackText}`)
        .reprompt(`${fallbackText}`)
        .getResponse()
    }

    const { canCallAPI } = getSessionAttributes(handlerInput)
    // device address apiへのアクセスが許可されていない
    if (!canCallAPI && !getApiAccessToken(handlerInput.requestEnvelope)) {
      return responseBuilder.speak(`デバイスのアドレスを取得するための設定が必要です。設定する場合は、「設定する」と話しかけてください。${fallbackText}`)
        .reprompt(`デバイスアドレスの取得設定を行う場合は、「設定する」と話しかけてください。${fallbackText}`)
        .getResponse()
    }
    const region = await geteviceAddress(requestEnvelope, serviceClientFactory)
    // アドレスが登録されていない
    if (!region) {
      return responseBuilder.speak(`地名がデバイスに登録されていませんでした。アレクサアプリからデバイスの所在地の都道府県または市町村を設定してください。${fallbackText}`)
        .reprompt(`${fallbackText}`)
        .getResponse()
    }

    // ここからはSearchMeetupHandlerと同じ
    return SearchMeetupHandler.handle(handlerInput, region)
  }
}