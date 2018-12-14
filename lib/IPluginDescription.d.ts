export declare enum LoadingTime {
    STARTUP = 0,
    POSTSTART = 1
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
    author?: IAuthor;
    authors?: IAuthor[];
    ['plugin-lib$load']: LoadingTime;
    ['plugin-lib$depends']: string[];
}
export {};
