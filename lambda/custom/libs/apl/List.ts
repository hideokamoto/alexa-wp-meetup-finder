import { Directive } from 'ask-sdk-model'
import { TListTemplateItem } from '../../model'
import ListTemplateMetadataFactory from './ListMetadata'
export default class List {
  private documentPath: string = '../../templates/listEvents.json'
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
        EventListTemplateMetadata: this.metadataBuilder.getMetadata(),
        EventListTemplateListData: {
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