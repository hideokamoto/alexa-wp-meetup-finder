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