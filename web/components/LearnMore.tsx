import {useEffect, useLayoutEffect, useRef} from "preact/hooks";
import {marked} from "marked";
import * as _ from "lodash-es";

/** @ts-ignore @type {import('dompurify/index')} */
import DOMPurify from 'dompurify';

// @ts-ignore
import learnMore from '@assets/LearnMore.md?raw';
import Product from "../../shared/product";

export default function LearnMore(props: { onBack?: () => void }) {
    const iframeRef = useRef<HTMLIFrameElement>();

    useLayoutEffect(() => {
        marked.use({ silent: true });
    }, []);

    useEffect(() => {
        const learnMoreText = _.template(learnMore)({
           appName: Product.productName
        });
        const md = DOMPurify.sanitize(marked.parse(learnMoreText));
        const iframe = iframeRef.current;
        if (!iframe)
            return;

        iframe.srcdoc = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Learn More</title>
            <style>
            body {
              margin: 0 0.5rem;
              padding: 0;
              user-select: none;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", sans-serif;
            }
            </style>
        </head>
        <body>
            <div class="markdown-body">
                ${md}
            </div>
        </body>
        </html>
        `;
    }, []);

    return (<>
        <a href="javascript:void(0)" onClick={() => props.onBack?.()} draggable={false} className="self-start mx-2 text-blue-600 hover:underline">Back</a>
        <iframe ref={iframeRef} className="w-screen flex-1" />
    </>);
}
