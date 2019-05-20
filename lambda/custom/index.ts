import * as Alexa from 'ask-sdk-core';
import "tslib";
import {
  isLaunchRequest,
  isHelpIntent,
  isStopIntent,
  isCancelIntent,
  isNoIntent,
  isMatchedIntent,
  RequestLogger,
  ResponseLogger,
  getLocale,
  getSlotValue,
  enqueueProgressiveResponse
} from 'ask-utils'
import {
  SessionEndedRequestHandler
} from '@ask-utils/handlers'
import moment from 'moment-timezone'
import RequestHandler = Alexa.RequestHandler

import ResponseFactory from './libs/responseFactory'
import MeetupFinder from './libs/meetupFinder'


const LaunchRequestHandler: RequestHandler = {
  canHandle(handlerInput) {
    return isLaunchRequest(handlerInput)
  },
  handle(handlerInput) {
    const speechText = 'Welcome to the Alexa Skills Kit, you can say hello!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

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

const getTimezoneByLocale = (locale: string): string => {
  switch(locale) {
    case 'ja-JP':
    case 'ja':
    case 'JP':
    case 'ja_JP':
      return 'Tokyo/Asia'
    default:
      return 'Europe/London'
  }
}

const SearchByRegionIntentHandler: RequestHandler = {
  canHandle(handlerInput) {
    return isMatchedIntent(handlerInput, 'SearchByRegionIntent')
  },
  async handle(handlerInput) {
    const responseBuilder = ResponseFactory.init()
    await enqueueProgressiveResponse(handlerInput, 'ちょっとまってね')
    try {
      const finder = new MeetupFinder()
      const locale = getLocale(handlerInput)
      if (locale) finder.setLocale(locale)
      const region = getSlotValue(handlerInput, 'region')
      const timezone = getTimezoneByLocale(locale)
      if (timezone) {
        finder.setTimezone(timezone)
        moment.tz(timezone)
      }
      const data = await finder.setLocation(region).get()
      responseBuilder.putSpeechParagraph(`${data.location.description}の周辺で開催予定のイベントは、 次の${data.events.length}件です。`)
      data.events.forEach((event) => {
        const place = event.location.location.split(',')[0]
        const date = moment(event.date).format('YYYY/MM/DD HH')
        const p = [
          `${place}で`,
          `${date}に`,
          `${event.title.replace(/Meetup/ig, 'ミートアップ')}`,
          'が開催されます。'
        ].join('、')
        responseBuilder.putSpeechParagraph(p)
      })
      console.log(data)
    } catch (e) {
      console.log(e)
    }
    const { speechText } = responseBuilder.getResponse()
    return handlerInput.responseBuilder
      .speak(speechText)
      .addDirective({
        type: 'Alexa.Presentation.APL.RenderDocument',
        token: 'token',
        document: require('./templates/listEvents.json'),
        datasources: {
          "listTemplate1Metadata": {
              "type": "object",
              "objectId": "lt1Metadata",
              "backgroundImage": {
                  "contentDescription": null,
                  "smallSourceUrl": null,
                  "largeSourceUrl": null,
                  "sources": [
                      {
                          "url": "https://d2o906d8ln7ui1.cloudfront.net/images/LT1_Background.png",
                          "size": "small",
                          "widthPixels": 0,
                          "heightPixels": 0
                      },
                      {
                          "url": "https://d2o906d8ln7ui1.cloudfront.net/images/LT1_Background.png",
                          "size": "large",
                          "widthPixels": 0,
                          "heightPixels": 0
                      }
                  ]
              },
              "title": "Calories in 1 Serving of Cheese",
              "logoUrl": "https://d2o906d8ln7ui1.cloudfront.net/images/cheeseskillicon.png"
          },
          "listTemplate1ListData": {
              "type": "list",
              "listId": "lt1Sample",
              "totalNumberOfItems": 10,
              "listPage": {
                  "listItems": [
                      {
                          "listItemIdentifier": "gouda",
                          "ordinalNumber": 1,
                          "textContent": {
                              "primaryText": {
                                  "type": "PlainText",
                                  "text": "Gouda"
                              },
                              "secondaryText": {
                                  "type": "PlainText",
                                  "text": "Serving Size: 1oz (28g)"
                              },
                              "tertiaryText": {
                                  "type": "PlainText",
                                  "text": "100 cal"
                              }
                          },
                          "token": "gouda"
                      },
                      {
                          "listItemIdentifier": "cheddar",
                          "ordinalNumber": 2,
                          "textContent": {
                              "primaryText": {
                                  "type": "PlainText",
                                  "text": "Sharp Cheddar"
                              },
                              "secondaryText": {
                                  "type": "RichText",
                                  "text": "Serving Size: 1 slice (28g)"
                              },
                              "tertiaryText": {
                                  "type": "PlainText",
                                  "text": "113 cal"
                              }
                          },
                          "token": "cheddar"
                      },
                      {
                          "listItemIdentifier": "blue",
                          "ordinalNumber": 3,
                          "textContent": {
                              "primaryText": {
                                  "type": "PlainText",
                                  "text": "Blue"
                              },
                              "secondaryText": {
                                  "type": "RichText",
                                  "text": "Serving Size: 1c, crumbled (135g)"
                              },
                              "tertiaryText": {
                                  "type": "PlainText",
                                  "text": "476 cal"
                              }
                          },
                          "token": "blue"
                      },
                      {
                          "listItemIdentifier": "brie",
                          "ordinalNumber": 4,
                          "textContent": {
                              "primaryText": {
                                  "type": "PlainText",
                                  "text": "Brie"
                              },
                              "secondaryText": {
                                  "type": "RichText",
                                  "text": "Serving Size: 1oz (28g)"
                              },
                              "tertiaryText": {
                                  "type": "PlainText",
                                  "text": "95 cal"
                              }
                          },
                          "token": "brie"
                      },
                      {
                          "listItemIdentifier": "cheddar",
                          "ordinalNumber": 5,
                          "textContent": {
                              "primaryText": {
                                  "type": "PlainText",
                                  "text": "Cheddar"
                              },
                              "secondaryText": {
                                  "type": "RichText",
                                  "text": "Serving Size: 1oz (28g)"
                              },
                              "tertiaryText": {
                                  "type": "PlainText",
                                  "text": "113 cal"
                              }
                          },
                          "token": "cheddar"
                      },
                      {
                          "listItemIdentifier": "parm",
                          "ordinalNumber": 6,
                          "textContent": {
                              "primaryText": {
                                  "type": "PlainText",
                                  "text": "Parm"
                              },
                              "secondaryText": {
                                  "type": "RichText",
                                  "text": "Serving Size: 1oz (28g)"
                              },
                              "tertiaryText": {
                                  "type": "PlainText",
                                  "text": "122 cal"
                              }
                          },
                          "token": "parm"
                      }
                  ]
              }
          }
      }
      })
      .getResponse()
  }
}

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
