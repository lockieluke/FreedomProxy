import * as _ from 'lodash-es';

type ExtensionManifest = {
    name: string;
    version: string;
}
export default abstract class ExtensionResponder {

    private readonly manifest: ExtensionManifest;
    readonly messagePrefix: string;

    protected constructor(extensionManifest: ExtensionManifest, messagePrefix?: string) {
        this.manifest = extensionManifest;
        this.messagePrefix = messagePrefix ?? _.camelCase(extensionManifest.name);
    }

    onInit(): void {
        console.log(`✅ ExtensionResponder ${this.manifest.name} v${this.manifest.version} initialized.`);
    }

    abstract onMessage(message: Partial<{ type: string }>, sendResponse: (message: any) => void): void;

}
