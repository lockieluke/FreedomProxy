import fs from "fs-extra";
import * as _ from 'lodash-es';

const wrapperTemplateHtml = _.template(await fs.readFile('wrapper/index.html', 'utf-8'));
const webHTML = await fs.readFile('dist/index.html', 'base64');
const html = wrapperTemplateHtml({
    title: "Student Portal",
    url: `data:text/html;base64,${webHTML}`,
    html: webHTML
});

await fs.writeFile('dist/wrapper.html', html);
console.log('✅  FreedomProxy Wrapper Rebuilt');
