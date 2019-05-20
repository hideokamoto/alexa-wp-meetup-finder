import { escapeXmlCharacters } from 'ask-sdk-core'
import { TListTemplateItem } from '../../model'
export default class ListItem {
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
