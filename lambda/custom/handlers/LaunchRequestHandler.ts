import { HandlerInput } from 'ask-sdk-core'
import { Response } from 'ask-sdk-model'
import {
  isLaunchRequest
} from 'ask-utils'

export default  {
  canHandle(handlerInput: HandlerInput): boolean {
    return isLaunchRequest(handlerInput)
  },
  handle(handlerInput: HandlerInput): Response {
    const speechText = 'Welcome to the Alexa Skills Kit, you can say hello!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};