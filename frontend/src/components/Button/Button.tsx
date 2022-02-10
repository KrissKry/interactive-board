/* eslint-disable react/require-default-props */
import { IonButton, IonSpinner } from '@ionic/react';
import React from 'react';
import classNames from 'classnames';

type ButtonFill = 'clear' | 'outline' | 'solid';

type ButtonColor = 'base' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';

export interface ButtonProps {

    /**
     * Additional classname passed to button
     * @default ''
     */
    className?: string;

    /**
     * background button color
     * @default is set by scss base button
     */
    color?: ButtonColor;

    /**
     * button's custom onClick handler, used with priority over onClick
     * @default undefined
     */
    // eslint-disable-next-line no-unused-vars
    customOnClick?: (value?: any) => void;

    /**
     * If button is blocked from being pressable
     * @default false
     */
    disabled?: boolean;

    /**
     * if button fills container
     * @default false
     */
    expand?: boolean;

    /**
     * Typeof button background
     * @default solid
     */
    fill?: ButtonFill;

    /**
     * Button id f.e. used in callback
     * @default empty string
     */
    id?: string;

    /**
     * Loading state
     * @default false
     */
    loading?: boolean;

    /**
     * If hover animation / action should be disabled
     * @default false
     */
    noHover?: boolean;

    /**
     * Additional button style
     * @default {}
     */
    style?: React.CSSProperties;

    /**
     * Button display text
     * @default ''
     */
    text?: string;

}

export const Button = ({
    className = '',
    color = 'base',
    customOnClick,
    disabled = false,
    expand = false,
    fill = 'solid',
    id = '',
    loading = false,
    noHover = false,
    style = {},
    text = '',
    children,
    onClick,
// eslint-disable-next-line no-undef
}: ButtonProps & React.ButtonHTMLAttributes<HTMLIonButtonElement>) : JSX.Element => (
    <IonButton
        className={classNames(
            `ee-c-button--${color}`,
            noHover && 'ee-c-button--no-hover',
            className,
        )}
        disabled={disabled}
        expand={expand ? 'block' : undefined}
        fill={fill}
        id={id}
        onClick={typeof customOnClick !== 'undefined' ? () => customOnClick(id) : onClick}
        style={style}
    >
        {/* eslint-disable-next-line no-nested-ternary */}
        {loading ? <IonSpinner name="crescent" color="dark" /> : (text.length ? text : children)}
    </IonButton>
);
