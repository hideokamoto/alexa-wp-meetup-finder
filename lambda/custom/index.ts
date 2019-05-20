import * as Alexa from 'ask-sdk-core';
import "tslib";
import {
  isHelpIntent,
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

const HelloWorldIntentHandler: RequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'HelloWorldIntent';
  },
  handle(handlerInput) {
    const speechText = 'Hello World!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const HelpIntentHandler: RequestHandler = {
  canHandle(handlerInput) {
    return isHelpIntent(handlerInput)
  },
  handle(handlerInput) {
    const speechText = 'You can say hello to me!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler: RequestHandler = {
  canHandle(handlerInput) {
    return isCancelIntent(handlerInput) || isNoIntent(handlerInput) || isStopIntent(handlerInput)
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Hello World', speechText)
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
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

export const handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    HelloWorldIntentHandler,
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
