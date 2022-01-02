import React from 'react';
import CanvasColorGrid from './CanvasColorGrid';

interface ToolbarProps {
    pickColor: (color: string) => void;
}

const CanvasToolbar = ({ pickColor }: ToolbarProps) : JSX.Element => {
    const colors = [
        '#1ABC9C',
        '#16A085',
        '#2ECC71',
        '#27AE60',
        '#3498DB',
        '#2980B9',
        '#9B59B6',
        '#8E44AD',
        '#F1C40F',
        '#F39C12',
        '#E67E22',
        '#D35400',
        '#E74C3C',
        '#C0392B',
        '#ECF0F1',
        '#BDC3C7',
        '#95A5A6',
        '#7F8C8D',
        '#34495E',
        '#2C3E50',
    ];

    return (
        <div className="ee-canvas-toolbar">
            <CanvasColorGrid colors={colors} pickColor={pickColor} />
        </div>
    );
};
// kolory flat-UI
// grubość póki co po chuju
// cofnij / powtórz??
// zrzut aktualnego stanu
// clear canvas -> func background()
export default CanvasToolbar;
