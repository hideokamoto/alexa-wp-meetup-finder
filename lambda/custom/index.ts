import * as Alexa from 'ask-sdk-core';
import "tslib";
import {
  isStopIntent,
  isCancelIntent,
  isNoIntent,
  isYesIntent,
  RequestLogger,
  ResponseLogger,
} from 'ask-utils'
import {
  SessionEndedRequestHandler
} from '@ask-utils/handlers'
import RequestHandler = Alexa.RequestHandler
import SearchByRegionIntentHandler from './handlers/SearchMeetupHandler'
import LaunchRequestHandler from './handlers/LaunchRequestHandler'
import HelpIntentHandler from './handlers/HelpHandler'
import {
  getRandomSpeechconTexts
} from './libs/helpers'

const CancelAndStopIntentHandler: RequestHandler = {
  canHandle(handlerInput) {
    return isCancelIntent(handlerInput) || isNoIntent(handlerInput) || isStopIntent(handlerInput)
  },
  handle(handlerInput) {
    const speechText = getRandomSpeechconTexts([
      'またね',
      'ごきげんよう',
      'さようなら',
      'じゃね'
    ]);

    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
  },
};

const YesIntentHandler: RequestHandler = {
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

const ErrorHandler: Alexa.ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('すみません。ちょっとトラブルが起きたみたいです。もう一度言っていただけますか？')
      .reprompt('ちょっと聞き取りに失敗してしまいました・・・もう一度話しかけてくれると嬉しいです。')
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

export const handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    SearchByRegionIntentHandler,
    HelpIntentHandler,
    YesIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addRequestInterceptors(RequestLogger)
  .addResponseInterceptors(ResponseLogger)
  .addErrorHandlers(ErrorHandler)
  .withApiClient(new Alexa.DefaultApiClient())
  .lambda();
