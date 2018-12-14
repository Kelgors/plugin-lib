export enum LoadingTime {
  STARTUP,
  POSTSTART
}
interface IAuthor {
  name: string;
  email?: string;
  url?: string;
}
export interface IPluginDescription {
  name: string;
  version?: string;
  main: string;
  author?: IAuthor,
  authors?: IAuthor[],
  ['plugin-lib$load']: LoadingTime,
  ['plugin-lib$depends']: string[]
}
