export default class ResponseFactory {
  public static init() {
    const response = {
      speechTexts: [''],
      repromptTexts: ['']
    }
    return {
      putSpeechParagraph(text: string) {
        response.speechTexts.push(`<p>${text}</p>`)
        return this
      },
      putSpeechText(text: string) {
        response.speechTexts.push(text)
        return this
      },
      putRepromptText(text: string) {
        response.repromptTexts.push(text)
        return this
      },
      getResponse() {
        return {
          speechText: response.speechTexts.join(' '),
          repromptText: response.repromptTexts.join(' ')
        }
      }
    }
  }
}