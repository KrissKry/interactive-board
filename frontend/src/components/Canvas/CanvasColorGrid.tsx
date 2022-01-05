import React from 'react';
import CanvasColorPick from './CanvasColorPick';

interface ColorGridProps {
    colors: string[];

    // eslint-disable-next-line no-unused-vars
    pickColor: (color: string) => void;
}

const CanvasColorGrid = ({ colors, pickColor }: ColorGridProps) : JSX.Element => (
    <div className="ee-canvas-toolbar--colors">
        {colors.map((item) => (
            <CanvasColorPick
                key={item}
                backgroundColor={item}
                pickColor={pickColor}
            />
        ))}
    </div>
);

export default CanvasColorGrid;
