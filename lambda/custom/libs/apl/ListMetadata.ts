import { escapeXmlCharacters } from 'ask-sdk-core'
export default class ListTemplateMetadataFactory {
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
      title: "Display Title here",
      title_short: "For Echo Spot",
      logoUrl: ""
  }
    return {
      setTitle(title: string) {
        metadata.title = escapeXmlCharacters(title)
        return this
      },
      setShortTitle(title: string) {
        metadata.title_short = escapeXmlCharacters(title)
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