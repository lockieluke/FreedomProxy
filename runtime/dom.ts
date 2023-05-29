import $ from 'cash-dom';
import isRelativeUrl from "is-relative-url";
import * as _ from 'lodash-es';
import validDataUrl from 'valid-data-url';

export default class DOM {

    static runDomClock() {
        const selectors = [
            'script[src]',
            'img[src]',
            'div'
        ].join(',');

        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    _.defer(() => {
                        const $elm = $(node);
                        const tagName = _.toLower($elm.prop('tagName'));
                        const src = $elm.attr('src');
                        const style = $elm.attr('style');
                        if (!src && !style)
                            return;

                        // Copy attributes to new element
                        const $newElm = $(`<${tagName}></${tagName}>`);
                        for (const attr of $elm.prop('attributes'))
                            $newElm.attr(attr.name, attr.value);

                        if (src) {
                            if (!src.startsWith(window['serverUrl']) && !validDataUrl(src)) {
                                // Rewrite src
                                const newSrc = `${window['serverUrl']}/mask?url=${isRelativeUrl(src) ? _.toString(new URL(src, window['targetUrl'])) : src}`;
                                $newElm.attr('src', newSrc);
                            } else
                                return;
                        }

                        if (style) {
                            // Rewrite url() in style
                            const newStyle = style.replace(/url\((.*?)\)/g, (match, p1) => {
                                if (p1.startsWith(window['serverUrl']) || validDataUrl(p1))
                                    return match;
                                return `url(${window['serverUrl']}/mask?url=${isRelativeUrl(p1) ? _.toString(new URL(p1, window['targetUrl'])) : p1})`;
                            });
                            $newElm.attr('style', newStyle);
                        }

                        $elm.replaceWith($newElm);
                    });
                });
            });
        });

        observer.observe(document, {
            childList: true,
            subtree: true,
            attributes: true
        });
    }

}
