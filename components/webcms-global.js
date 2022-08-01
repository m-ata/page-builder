import { createContext } from 'react';
/*
It is configured in _app.js.
The props defined in this component can also be used in other components.
To do this, simply call webcms-global from an external component.
E.g:
import WebCmsGlobal from "components/webcms-global";

Then into const,
const {GENERAL_SETTINGS} = useContext(WebCmsGlobal);

This like:
<div>{GENERAL_SETTINGS.ORESTURL}</div>
 */

const WebCmsGlobal = createContext(undefined, undefined);

export default WebCmsGlobal;