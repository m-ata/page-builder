/**
 * @jest-environment jsdom
 */

import React from "react";
import Index from "../../../pages/page-builder";
import {render} from "../../test-utils";


test('renders page builder page', () => {
    render(<Index />);
});