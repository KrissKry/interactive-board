import React from 'react';

interface ColorProps {
    backgroundColor: string;

    // eslint-disable-next-line no-unused-vars
    pickColor: (backgroundColor: string) => void;
}
const CanvasColorPick = ({ backgroundColor, pickColor }: ColorProps) : JSX.Element => (
    <button
        type="button"
        aria-label="ColorPick"
        className=""
        style={{ backgroundColor }}
        onClick={() => pickColor(backgroundColor)}
    />
);

export default CanvasColorPick;
