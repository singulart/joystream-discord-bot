export interface IVideoResponse {
    data: IData
}

export interface IData {
    videosConnection: IVideoConnection
}

export interface IVideoConnection {
    edges: IVideo[]
}

export interface IVideo {
    node: INode
}

export interface INode {
    title: string,
    description: string,
    duration: string,
    id: string,
    thumbnailPhotoDataObject: IThumb,
    channel: IChannel,
    category: ICategory,
    language: ILanguage
}

export interface IThumb {
    liaison: ILiaison,
    joystreamContentId: string
}

export interface ILiaison {
    metadata: string
}

export interface IChannel {
    title: string,
    id: string,
    avatarPhotoDataObject: IThumb,
    createdById: string;
}

export interface ICategory {
    name: string;
}

export interface ILanguage {
    iso: string;
}
