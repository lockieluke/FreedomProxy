import {createContext} from "react";

export const SharedCTX = createContext<{
    connected: boolean,
    url: string,
    setUrl: (url: string) => void,
    urls: string[],
    addUrl: (url: string) => void,
    removeTopUrl: () => void,
    showAboutDialog: boolean,
    setShowAboutDialog: (showAboutDialog: boolean) => void,
    isLoading: boolean,
    setIsLoading: (isLoading: boolean) => void
}>({
    connected: false,
    url: undefined,
    setUrl: () => {},
    urls: [],
    addUrl: () => {},
    removeTopUrl: () => {},
    showAboutDialog: false,
    setShowAboutDialog: () => {},
    isLoading: false,
    setIsLoading: () => {}
});
