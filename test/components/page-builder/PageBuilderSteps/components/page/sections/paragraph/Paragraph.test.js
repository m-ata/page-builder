/**
 * @jest-environment jsdom
 */

import React from "react";
import {render} from "../../../../../../../test-utils";
import Paragraph
    from "../../../../../../../../components/page-builder/PageBuilderSteps/components/page/sections/paragraph/Paragraph";

test('renders Paragraph component', () => {
    render(<Paragraph paragraph={'<p>testing</p>'} />, {});
});