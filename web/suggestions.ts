/// <reference path="types.d.ts" />

import to from "await-to-js";

export default class Suggestions {

    static async fetchSuggestions(keyword: string): Promise<string[]> {
        `https://suggestqueries.google.com/complete/search?client=chrome&q=${keyword}`
        const [err, {suggestions}] = await to(window.helper.send('fetch-search-suggestions', {
            keyword
        }));
        if (err)
            throw err;

        return suggestions ?? [];
    }

}
