// @ts-ignore
import dinoHTML from '@assets/dino.html?raw';
import {createRef, useEffect} from "react";

export default function ChromeDino() {
    const dinoFrameRef = createRef<HTMLIFrameElement>();

    useEffect(() => {
        const dinoFrame = dinoFrameRef.current;
        if (!dinoFrame)
            return;

        window.addEventListener('keydown', () => {
            if (document.activeElement !== dinoFrame)
                dinoFrame.focus();
        });
    }, []);

    return (
        <iframe ref={dinoFrameRef} tabIndex={-1} className="w-3/4" srcDoc={dinoHTML} onLoad={event => {
            const dinoFrame = event.target as HTMLIFrameElement;
            if (!dinoFrame)
                return;

            dinoFrame.focus();
            dinoFrame.style.height = `${dinoFrame.contentWindow.document.body.scrollHeight}px`;
            dinoFrame.style.width = `${dinoFrame.contentWindow.document.body.scrollWidth}px`;

            dinoFrame.addEventListener('blur', () => {
                dinoFrame.focus();
            });
        }} />
    );
}
