import { HandlerInput } from 'ask-sdk-core'
import { Response } from 'ask-sdk-model'
import {
  isMatchedIntent,
} from 'ask-utils'
export default {
  canHandle(handlerInput: HandlerInput): boolean {
    return isMatchedIntent(handlerInput, 'RequestDeviceAddressIntent')
  },
  handle(handlerInput: HandlerInput): Response {
    const { responseBuilder } = handlerInput
    return responseBuilder
      .speak([
        'Alexaアプリにデバイスのアドレスを取得するための設定カードを送信しました。',
        'アプリを開いて、設定してください。',
        'なお、このスキルでは、都道府県または市町村のデータをイベント検索に利用します。',
        'それ以外のデータを利用することや、検索以外の用途に利用することはありません。',
        'アプリの設定が終わったら、「Alexa、ワードプレスイベント検索で検索」のように話しかけてください。'
      ].join(' '))
      .withAskForPermissionsConsentCard(['alexa::devices:all:address:full:read'])
      .getResponse()
  }
}