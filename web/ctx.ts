import {createContext} from "react";

export const SharedCTX = createContext<{
    connected: boolean,
    url: string,
    setUrl: (url: string) => void,
    isLoading: boolean,
    setIsLoading: (isLoading: boolean) => void
}>({
    connected: false,
    url: "",
    setUrl: () => {},
    isLoading: false,
    setIsLoading: () => {}
});
