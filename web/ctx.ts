import {createContext} from "react";

export const SharedCTX = createContext<{
    connected: boolean,
    url: string,
    setUrl: (url: string) => void,
    urls: string[],
    addUrl: (url: string) => void,
    removeTopUrl: () => void,
    isLoading: boolean,
    setIsLoading: (isLoading: boolean) => void
}>({
    connected: false,
    url: undefined,
    setUrl: () => {},
    urls: [],
    addUrl: () => {},
    removeTopUrl: () => {},
    isLoading: false,
    setIsLoading: () => {}
});
