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