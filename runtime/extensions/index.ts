import {Cash} from 'cash-dom';
import Debug from "../debug";

type ExtensionManifest = {
    name: string;
    version: string;
    requireElements?: string[] | '*';
}
export default abstract class Extension {

    private readonly manifest: ExtensionManifest;

    protected constructor(extensionManifest: ExtensionManifest) {
        this.manifest = extensionManifest;
    }

    onInit(): void {
        Debug.log(`✅ Extension ${this.manifest.name} v${this.manifest.version} initialized.`);
    }

    onDomNodeAdded($elm: Cash): void {};

}
