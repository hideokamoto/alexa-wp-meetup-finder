import { escapeXmlCharacters } from 'ask-sdk-core'
export default class ResponseFactory {
  public static init() {
    const response = {
      speechTexts: [''],
      repromptTexts: [''],
      cardTitle: '',
      cardTexts: ['']
    }
    return {
      putSpeechParagraph(text: string) {
        response.speechTexts.push(`<p>${escapeXmlCharacters(text)}</p>`)
        return this
      },
      putSpeechText(text: string) {
        response.speechTexts.push(escapeXmlCharacters(text))
        return this
      },
      putRepromptText(text: string) {
        response.repromptTexts.push(escapeXmlCharacters(text))
        return this
      },
      putCardTitle(title: string) {
        response.cardTitle = title
        return this
      },
      putCardContent(content: string) {
        response.cardTexts.push(content)
        return this
      },
      getResponse() {
        return {
          speechText: response.speechTexts.join(' '),
          cardTitle: response.cardTitle,
          cardText: response.cardTexts.filter(content => content).join('\n'),
          repromptText: response.repromptTexts.join(' ')
        }
      }
    }
  }
}