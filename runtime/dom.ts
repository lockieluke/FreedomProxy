import $ from 'cash-dom';
import * as _ from 'lodash-es';
import * as async from 'modern-async';
import validDataUrl from 'valid-data-url';
import Utils from "./utils";

export default class DOM {

    static runDomClock() {
        const observer = new MutationObserver(async mutations => {
            await async.forEach(mutations, async mutation => {
                const addedNodes = _.castArray(mutation.addedNodes);
                if (_.isEmpty(addedNodes))
                    return;

                await async.forEach(addedNodes, addedNode => {
                    const $elm = $(_.first(addedNode));
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
                        $newElm.attr('src', Utils.rewriteUrl(src));
                        needReplace = true;
                    }

                    if (style) {
                        // Rewrite url() in style
                        const newStyle = style.replace(/url\((.*?)\)/g, (match, p1) => {
                            if (p1.startsWith(window['serverUrl']) || validDataUrl(p1))
                                return match;
                            needReplace = true;
                            return `url(${Utils.rewriteUrl(p1)})`;
                        });
                        $newElm.attr('style', newStyle);
                    }

                    if (needReplace)
                        $elm.replaceWith($newElm);
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
