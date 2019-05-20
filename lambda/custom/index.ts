import * as Alexa from 'ask-sdk-core';
import { Directive } from 'ask-sdk-model';
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
  enqueueProgressiveResponse,
  getSupportedInterfaces
} from 'ask-utils'
import {
  SessionEndedRequestHandler
} from '@ask-utils/handlers'
import moment from 'moment-timezone'
import RequestHandler = Alexa.RequestHandler
import escapeXmlCharacters = Alexa.escapeXmlCharacters

import ResponseFactory from './libs/responseFactory'
import MeetupFinder from './libs/meetupFinder'
import {
  TEvent
} from './model'


class ListTemplateMetadataFactory {
  public static init() {
    const metadata = {
      type: "object",
      objectId: "lt1Metadata",
      backgroundImage: {
          contentDescription: null,
          smallSourceUrl: null,
          largeSourceUrl: null,
          sources: [
              {
                  url: "https://d2o906d8ln7ui1.cloudfront.net/images/LT1_Background.png",
                  size: "small",
                  widthPixels: 0,
                  heightPixels: 0
              },
              {
                  url: "https://d2o906d8ln7ui1.cloudfront.net/images/LT1_Background.png",
                  size: "large",
                  widthPixels: 0,
                  heightPixels: 0
              }
          ]
      },
      title: "Calories in 1 Serving of Cheese",
      logoUrl: "https://d2o906d8ln7ui1.cloudfront.net/images/cheeseskillicon.png"
  }
    return {
      setTitle(title: string) {
        metadata.title = escapeXmlCharacters(title)
        return this
      },
      setLogoURL(url: string) {
        metadata.logoUrl = escapeXmlCharacters(url)
        return this
      },
      getMetadata() {
        return metadata
      }
    }
  }
}

interface TListTemplateItem {
  listItemIdentifier: string
  ordinalNumber: number
  textContent: {
      primaryText: string
      secondaryText: string
      tertiaryText?: string
  },
  token: string
}
class ListItem {
  private ordinalNumber: number
  private listItemIdentifier: string = ''
  private primaryText: string = ''
  private secondaryText: string = ''
  private tertiaryText: string = ''
  constructor(num: number, id: string) {
    this.ordinalNumber = num
    this.listItemIdentifier = id
  }
  setPrimaryText(text: string) {
    this.primaryText = escapeXmlCharacters(text)
    return this
  }
  setSecondaryText(text: string) {
    this.secondaryText = escapeXmlCharacters(text)
    return this
  }
  setTeriraryText(text: string) {
    this.tertiaryText = escapeXmlCharacters(text)
    return this
  }
  getItem(): TListTemplateItem {
    return {
      listItemIdentifier: this.listItemIdentifier,
      token: this.listItemIdentifier,
      ordinalNumber: this.ordinalNumber,
      textContent: {
        primaryText: this.primaryText,
        secondaryText: this.secondaryText,
        tertiaryText: this.tertiaryText
      }
    }
  }
}
class List {
  private documentPath: string = './templates/listEvents.json'
  private metadataBuilder: any
  private listItem: TListTemplateItem[] = []
  constructor(metadataBuilder = ListTemplateMetadataFactory.init()) {
    this.metadataBuilder = metadataBuilder
  }
  putListItem(item: TListTemplateItem) {
    this.listItem.push(item)
    return this
  }
  getDirective():Directive {
    return {
      type: 'Alexa.Presentation.APL.RenderDocument',
      token: 'token',
      document: require(this.documentPath),
      datasources: {
        listTemplate1Metadata: this.metadataBuilder.getMetadata(),
        listTemplate1ListData: {
          type: "list",
          listId: "lt1Sample",
          totalNumberOfItems: this.listItem.length,
          listPage: {
              listItems: this.listItem
          }
        }
      }
    }
  }
}

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
      return 'Asia/Tokyo'
    default:
      return 'Europe/London'
  }
}

const getLocation = (event: TEvent): string => {
  const place = event.location.location.split(',')[0]
  return place.replace(/Tōkyō-to/, '東京都')
}

const SearchByRegionIntentHandler: RequestHandler = {
  canHandle(handlerInput) {
    return isMatchedIntent(handlerInput, 'SearchByRegionIntent')
  },
  async handle(handlerInput) {
    const { responseBuilder } = handlerInput
    const builder = ResponseFactory.init()
    await enqueueProgressiveResponse(handlerInput, 'ちょっとまってね')
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
    if (!data) {
      return responseBuilder.speak('データの取得に失敗しました。')
        .getResponse()
    }
    builder.putSpeechParagraph(`${data.location.description}の周辺で開催予定のイベントは、 次の${data.events.length}件です。`)
    // APL系処理のセットアップ
    const metadataBuilder = ListTemplateMetadataFactory.init()
    metadataBuilder.setTitle(`${data.location.description}周辺のイベント情報`)
    const directive = new List(metadataBuilder)

    data.events.forEach((event, i) => {
      const place = getLocation(event)
      const date = moment(event.date).format('YYYY/MM/DD HH時')
      const p = [
        `${place}で`,
        `${date}に`,
        `${event.title.replace(/Meetup/ig, 'ミートアップ')}`,
        'が開催されます。'
      ].join('、')
      builder.putSpeechParagraph(p)
      const number = i + 1
      const Item = new ListItem(number, `event-${number}`)
      Item.setPrimaryText(`${date} ~`)
        .setSecondaryText(event.title)
      directive.putListItem(Item.getItem())
    })
    const { speechText } = builder.getResponse()
    responseBuilder.speak(speechText)
      .reprompt('他の地域も調べますか？')
    const interfaces = getSupportedInterfaces(handlerInput)
    if (interfaces["Alexa.Presentation.APL"]) {
      responseBuilder.addDirective(directive.getDirective())
    }
    return responseBuilder.getResponse()
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
