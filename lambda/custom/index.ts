import * as Alexa from 'ask-sdk-core';
import "tslib";
import {
  isStopIntent,
  isCancelIntent,
  isNoIntent,
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
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addRequestInterceptors(RequestLogger)
  .addResponseInterceptors(ResponseLogger)
  .addErrorHandlers(ErrorHandler)
  .withApiClient(new Alexa.DefaultApiClient())
  .lambda();
