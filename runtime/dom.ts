import $ from 'cash-dom';
import * as async from 'modern-async';
import isRelativeUrl from "is-relative-url";
import * as _ from 'lodash-es';
import validDataUrl from 'valid-data-url';

export default class DOM {

    static runDomClock() {
        const observer = new MutationObserver(mutations => {
            _.defer(async () => {
                await async.forEach(mutations, async mutation => {
                    const addedNodes = _.castArray(mutation.addedNodes);
                    if (_.isEmpty(addedNodes))
                        return;

                    await async.forEach(addedNodes, addedNode => {
                        const $elm = $(addedNode);
                        const tagName = _.toLower($elm.prop('tagName'));
                        const src = $elm.attr('src');
                        const style = $elm.attr('style');
                        if (!src && !style)
                            return;

                        // Copy attributes to new element
                        const $newElm = $(`<${tagName}></${tagName}>`);
                        const attributes: NamedNodeMap = $elm.prop('attributes');
                        let needReplace = false;
                        $newElm.attr(_.fromPairs(_.map(attributes, attr => [attr.name, attr.value])));

                        if (src && !src.startsWith(window['serverUrl']) && !validDataUrl(src)) {
                            // Rewrite src
                            const newSrc = `${window['serverUrl']}/mask?url=${isRelativeUrl(src) ? _.toString(new URL(src, window['targetUrl'])) : src}`;
                            $newElm.attr('src', newSrc);
                            needReplace = true;
                        }

                        if (style) {
                            // Rewrite url() in style
                            const newStyle = style.replace(/url\((.*?)\)/g, (match, p1) => {
                                if (p1.startsWith(window['serverUrl']) || validDataUrl(p1))
                                    return match;
                                return `url(${window['serverUrl']}/mask?url=${isRelativeUrl(p1) ? _.toString(new URL(p1, window['targetUrl'])) : p1})`;
                            });
                            $newElm.attr('style', newStyle);
                            needReplace = true;
                        }

                        if (needReplace)
                            $elm.replaceWith($newElm);
                    });
                });
            });
        });

        observer.observe(document, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['src', 'style', 'href']
        });
    }

}
