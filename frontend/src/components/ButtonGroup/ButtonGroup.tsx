/* eslint-disable react/require-default-props */
import classNames from 'classnames';
import React from 'react';
import { Button } from '../Button';
import { ButtonProps } from '../Button/Button';

interface GroupProps {

    /**
     * Buttons which we want to render inside button group
     * @default []
     */
    buttons?: ButtonProps[],

    /**
     * HTML id used for identifying element and/or handling additional actions like scrollTo
     * @default ''
     */
    groupId?: string;

    /**
     * Additional group className(s)
     * @default ''
     */
    groupClassname?: string;

    /**
     * Optional group styles
     * @default {}
     */
    style?: React.CSSProperties;

    /**
     * Uniform callback for any item in the button array
     * @default '() => null'
     */
    onClick?: () => void;

    /**
     * Active button id
     * @default ''
     */
    activeId?: string;

    /**
     * Additional classname passed to active button
     * @default ''
     */
    activeClassname?: string;

    /**
     * Additional classname passed to inactive buttons
     * @default ''
     */
    inactiveClassname?: string;
}

export const ButtonGroup = ({
    buttons = [],
    groupId = '',
    groupClassname = '',
    style = {},
    onClick = () => {},
    activeId = '',
    // activeIdStyle = {},
    // inactiveIdStyle = {},
    activeClassname = '',
    inactiveClassname = '',

} : GroupProps) : JSX.Element => {
    if (typeof buttons === 'undefined' || buttons === null || !buttons.length) return (<></>);

    return (
        <div
            id={groupId}
            className={classNames(
                'ee-c-buttongroup',
                groupClassname,
            )}
            style={style}
        >
            {buttons.map((btn, index) => (
                <Button
                    // eslint-disable-next-line react/no-array-index-key
                    key={index}
                    // eslint-disable-next-line max-len
                    className={activeId && btn.id === activeId ? activeClassname : inactiveClassname}
                    color={btn.color}
                    customOnClick={btn.customOnClick}
                    disabled={btn.disabled}
                    expand={btn.expand}
                    fill={btn.fill}
                    id={btn.id}
                    loading={btn.loading}
                    noHover={btn.noHover}
                    style={btn.style}
                    text={btn.text}
                    onClick={onClick}
                />
            ))}
        </div>
    );
};
