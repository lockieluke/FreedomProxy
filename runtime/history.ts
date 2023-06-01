import * as _ from 'lodash-es';

export default class History {

    static interceptHistoryActions() {
        window.history.pushState = _.constant(void 0);
        window.history.replaceState = _.constant(void 0);
        window.history.go = _.constant(void 0);
    }

}
