import $ from 'cash-dom';
import * as _ from 'lodash-es';
import * as async from 'modern-async';
import Utils from "../shared/utils";
import validDataUrl = require('valid-data-url');
import Extension from "./extensions";

export default class DOM {

    static runDomClock() {
        const observer = new MutationObserver(async mutations => {
            const addedNodes = _.castArray(await async.map(mutations, mutation => mutation.target));
            if (_.isEmpty(addedNodes))
                return;

            await async.forEach(addedNodes, async addedNode => {
                await async.forEach((window['extensions'] as Extension[]) ?? [], extension => {
                    if (_.isFunction(extension.onDomNodeAdded))
                        extension.onDomNodeAdded($(addedNode));
                });

                _.defer(async (addedNode: Element) => {
                    const $elm = $(addedNode);
                    if ($elm.attr('target'))
                        $elm.removeAttr('target');

                    await DOM.rewriteAttributes(addedNode);
                }, addedNode);
            });
        });

        observer.observe(document, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['src', 'href', 'target']
        });

        // Need separate observer for style attribute for some reason
        const styleObserver = new MutationObserver(async mutations => {
            const addedNodes = _.castArray(await async.map(mutations, mutation => mutation.target));
            if (_.isEmpty(addedNodes))
                return;

            await async.forEach(addedNodes, async addedNode => {
                const $elm = $(addedNode);
                const style = $elm.attr('style');
                if (!style)
                    return;

                const [newStyle, styleNeedReplacing] = DOM.rewriteStyle(style);
                if (!styleNeedReplacing)
                    return;

                $elm.attr('style', newStyle);
            });
        });

        styleObserver.observe(document, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style']
        });
    }

    static interceptDomActions() {
        Element.prototype.appendChild = new Proxy(Element.prototype.appendChild, {
            apply: function (target, thisArg, argumentsList) {
                DOM.rewriteAttributesSync(_.first(argumentsList));
                return target.apply(thisArg, argumentsList);
            }
        });

        Element.prototype.insertBefore = new Proxy(Element.prototype.insertBefore, {
            apply: function (target, thisArg, argumentsList) {
                DOM.rewriteAttributesSync(_.first(argumentsList));
                return target.apply(thisArg, argumentsList);
            }
        });

        Element.prototype.setAttribute = new Proxy(Element.prototype.setAttribute, {
            apply: function (target, thisArg, argumentsList) {
                // Uncaught RangeError: Maximum call stack size exceeded happens sometimes, rewriteAttributes has to be extremely optimised and fast
                argumentsList[1] = DOM.rewriteAttribute(argumentsList[0], argumentsList[1]);
                return target.apply(thisArg, argumentsList);
            }
        });

        (async () => {
            const elementTypes = [HTMLImageElement, HTMLScriptElement, HTMLDivElement, HTMLElement];
            await async.forEach(elementTypes, async elementType => {
                await async.forEach(['src', 'href'], elementAttribute => {
                    DOM.interceptAttributeSet(elementType.prototype, elementAttribute, function (value) {
                        this.setAttribute(elementAttribute, value);
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

    static passDomEventsToUI() {
        window.addEventListener('keydown', event => {
            if (Utils.controlKey(event) && event.shiftKey && event.key === 'l') {
                event.preventDefault();
                parent.postMessage({
                    type: 'omnibox.focus'
                }, '*');
            }
        });
    }

    static rewriteStyle(style: string): [string, boolean] {
        let needReplacing = false;
        const newStyle = style.replace(/url\((.*?)\)/g, (match, p1) => {
            if (p1.startsWith(window['serverUrl']) || validDataUrl(p1.replace(/^"(.*)"$/, '$1')))
                return match;
            needReplacing = true;
            return `url(${Utils.rewriteUrl(p1.replace(/^"(.*)"$/, '$1'))})`;
        });

        return [newStyle, needReplacing];
    }

    static rewriteAttribute(attr: string, value: string): string {
        if (attr === 'style') {
            const [newStyle, styleNeedReplacing] = DOM.rewriteStyle(_.toString(value));
            if (styleNeedReplacing)
                return newStyle;
        }

        if (['src', 'href'].includes(attr) && _.isString(value) && !Utils.isUrlRewritten(value))
            return Utils.rewriteUrl(value);

        return value;
    }

    static async rewriteAttributes(element: Element) {
        if (_.isFunction(element.getAttribute) && _.isFunction(element.setAttribute)) {
            await async.forEach(element.getAttributeNames(), attribute => {
                element.setAttribute(attribute, element.getAttribute(attribute));
            });
        }
    }

    static rewriteAttributesSync(element: Element) {
        if (_.isFunction(element.getAttribute) && _.isFunction(element.setAttribute)) {
            _.forEach(element.getAttributeNames(), attribute => {
                element.setAttribute(attribute, element.getAttribute(attribute));
            });
        }
    }

}
