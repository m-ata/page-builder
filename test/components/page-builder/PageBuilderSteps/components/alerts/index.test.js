/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import {AlertDialog} from "../../../../../../components/page-builder/PageBuilderSteps/components/alert";

describe('Alert Component', () => {
    test('renders Alert component with webPage case', () => {
        render(<AlertDialog alertDialogType={'webPage'} />);
        screen.getByText('Do you want to delete this web page ?');
    });

    test('renders Alert component with question case', () => {
        render(<AlertDialog alertDialogType={'qa'} />);
        expect(screen.getByText('Do you want to delete this question ?')).toBeInTheDocument();
    });
});