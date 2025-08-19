import inlineCss from '../../../dist/all/index.css?inline';
import { initAppWithIframe } from '@extension/shared';
import App from '@src/matches/all/App';

initAppWithIframe({ id: 'AWH-extension-container', app: <App />, inlineCss });
