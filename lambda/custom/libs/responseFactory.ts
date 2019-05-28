import { escapeXmlCharacters } from 'ask-sdk-core'
import { Directive } from 'ask-sdk-model'
export interface IResponseContent {
  speechText: string
  repromptText: string
  cardTitle: string
  cardText: string
  directive?: Directive
}
export interface IResponseBuilder {
  putSpeechParagraph(text: string): IResponseBuilder
  putSpeechText(text: string): IResponseBuilder
  putRepromptText(text: string): IResponseBuilder
  putCardTitle(title: string): IResponseBuilder
  putCardContent(content: string): IResponseBuilder
  setDirective(directive: Directive): IResponseBuilder
  getResponse(): IResponseContent
}
export default class ResponseFactory {
  public static init(): IResponseBuilder {
    const response = {
      speechTexts: [''],
      repromptTexts: [''],
      cardTitle: '',
      cardTexts: ['']
    }
    let directive: Directive | undefined
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
      setDirective(props: Directive) {
        directive = props
        return this
      },
      getResponse() {
        const content: IResponseContent = {
          speechText: response.speechTexts.join(' '),
          cardTitle: response.cardTitle,
          cardText: response.cardTexts.filter(content => content).join('\n'),
          repromptText: response.repromptTexts.join(' ')
        }
        if (!directive) return content
        return {
          ...content,
          directive
        }
      }
    }
  }
}