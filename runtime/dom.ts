import $ from 'cash-dom';
import * as _ from 'lodash-es';
import * as async from 'modern-async';
import validDataUrl from 'valid-data-url';
import Debug from "./debug";
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
                    let needReplacing = false;
                    $newElm.attr(_.fromPairs(_.map(attributes, attr => [attr.name, attr.value])));

                    if (src && !src.startsWith(window['serverUrl']) && !validDataUrl(src)) {
                        // Rewrite src
                        $newElm.attr('src', Utils.rewriteUrl(src));
                        needReplacing = true;
                    }

                    if (style) {
                        // Rewrite url() in style
                        const [newStyle, styleNeedReplacing] = DOM.rewriteStyle(style);
                        $newElm.attr('style', newStyle);
                        needReplacing = needReplacing || styleNeedReplacing;
                    }

                    if (needReplacing)
                        $elm.replaceWith($newElm);
                });
            });
        });

        observer.observe(document, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeOldValue: true,
            attributeFilter: ['src', 'style', 'href']
        });
    }

    static interceptDomActions() {
        Element.prototype.appendChild = new Proxy(Element.prototype.appendChild, {
            apply: function (target, thisArg, argumentsList) {
                DOM.rewriteAttributes(_.first(argumentsList));
                return target.apply(thisArg, argumentsList);
            }
        });

        Element.prototype.insertBefore = new Proxy(Element.prototype.insertBefore, {
            apply: function (target, thisArg, argumentsList) {
                DOM.rewriteAttributes(_.first(argumentsList));
                return target.apply(thisArg, argumentsList);
            }
        });

        (async () => {
            await async.forEach([HTMLImageElement, HTMLScriptElement, HTMLDivElement], async elementType => {
                await async.forEach(['src', 'href'], elementAttribute => {
                    DOM.interceptAttributeSet(elementType.prototype, elementAttribute, function (value) {
                        DOM.rewriteAttributes(this, { [elementAttribute]: _.toString(value) });
                    });
                });
            });
        })();
    }

    static interceptAttributeSet(element: Element, attribute: string, cb: Function) {
        Object.defineProperty(element, attribute, {
            set: function (value) {
                return cb.call(this, value);
            },
            get: function () {
                return this.getAttribute(attribute);
            }
        })
    }

    static rewriteStyle(style: string): [string, boolean] {
        let needReplacing = false;
        const newStyle = style.replace(/url\((.*?)\)/g, (match, p1) => {
            if (p1.startsWith(window['serverUrl']) || validDataUrl(p1))
                return match;
            needReplacing = true;
            return `url(${Utils.rewriteUrl(p1)})`;
        });

        return [newStyle, needReplacing];
    }

    static rewriteAttributes(element: Element, newValues: any = {}) {
        if (_.isFunction(element.getAttribute) && _.isFunction(element.setAttribute)) {
            const src = newValues['src'] ?? element.getAttribute('src');
            const href = newValues['href'] ?? element.getAttribute('href');
            // const style = newValues['style'] ?? element.getAttribute('style');

            if (src)
                element.setAttribute('src', Utils.rewriteUrl(src));

            if (href)
                element.setAttribute('href', Utils.rewriteUrl(href));

            // console.log(style, DOM.rewriteStyle(style)[0]);

            // if (style)
            //     element.setAttribute('style', DOM.rewriteStyle(style)[0]);
        }
    }

}
