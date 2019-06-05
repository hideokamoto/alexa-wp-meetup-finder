import * as Alexa from 'ask-sdk-core';
import "tslib";
import {S3PersistenceAdapter, ObjectKeyGenerators} from 'ask-sdk-s3-persistence-adapter'
import {
  isStopIntent,
  isCancelIntent,
  isNoIntent,
  RequestLogger,
  ResponseLogger,
  updateSessionAttributes,
} from 'ask-utils'
import {
  SessionEndedRequestHandler,
  DeleteDisabledUserHandler
} from '@ask-utils/handlers'
import RequestHandler = Alexa.RequestHandler
import SearchByRegionIntentHandler from './handlers/SearchMeetupHandler'
import SearchByDeviceAddressIntentHandler from './handlers/SearchMeetupByDevicecAddressHandler'
import RequestDeviceAddressIntentHandler from './handlers/RequestDevicecAddressHandler'
import LaunchRequestHandler from './handlers/LaunchRequestHandler'
import HelpIntentHandler from './handlers/HelpHandler'
import SaveTheRegionIntentHandler from './handlers/SaveTheRegion'
import {
  EventDetailBySlotIntentHandler,
  EventDetailUserEventIntentHandler
} from './handlers/EventDetail'
import {
  YesIntentHandler,
  YesSaveTheTownHandler,
  YesSearchByPersistentRegionHandler
} from './handlers/YesIntentHandlers/index'
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
      .withShouldEndSession(true)
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
    SearchByDeviceAddressIntentHandler,
    EventDetailBySlotIntentHandler,
    EventDetailUserEventIntentHandler,
    RequestDeviceAddressIntentHandler,
    HelpIntentHandler,
    SaveTheRegionIntentHandler,
    YesSaveTheTownHandler,
    YesSearchByPersistentRegionHandler,
    YesIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
    DeleteDisabledUserHandler as RequestHandler,
    {
      canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      },
      handle(handlerInput) {
        console.log(handlerInput.requestEnvelope)
        return ErrorHandler.handle(handlerInput, new Error('unhandled'))
      }
    }
  )
  .addRequestInterceptors(
    {
      process(handlerInput) {
        if (!Alexa.isNewSession(handlerInput.requestEnvelope)) return
        const canCallAPI = !!(Alexa.getApiAccessToken(handlerInput.requestEnvelope))
        updateSessionAttributes(handlerInput, {
          canCallAPI
        })
      }
    },
    RequestLogger
  )
  .addResponseInterceptors(ResponseLogger)
  .addErrorHandlers(ErrorHandler)
  .withApiClient(new Alexa.DefaultApiClient())
  .withPersistenceAdapter(
      new S3PersistenceAdapter({
          bucketName: 'wp-kyoto-ask-db',
          pathPrefix: 'wp-meetup-finder',
          objectKeyGenerator: ObjectKeyGenerators.deviceId
      })
  )
  .lambda();
