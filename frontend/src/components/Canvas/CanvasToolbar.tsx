// eslint-disable-next-line object-curly-newline
import React, { useMemo } from 'react';
import { useAppSelector } from '../../hooks';
import { CanvasTool, RGBColor } from '../../interfaces/Canvas';
import { getHexFromRGB } from '../../util/Canvas';
import CanvasColorGrid from './CanvasColorGrid';
import CanvasTools from './CanvasTools';

interface ToolbarProps {
    currentColor: RGBColor;

    // eslint-disable-next-line no-unused-vars
    pickColor: (color: string) => void;

    activeToolId: string;

    tools: CanvasTool[];

    activeBrushId: string;

    brushTools: CanvasTool[];
}
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

const CanvasToolbar = ({
    activeBrushId,
    activeToolId,
    brushTools,
    tools,
    currentColor,
    pickColor,
}: ToolbarProps) : JSX.Element => {
    const currentColorHex = useMemo(() => getHexFromRGB(currentColor), [currentColor]);
    const toolbarExpanded = useAppSelector((state) => state.menus.toolbarExpanded);

    return (
        <div className={['ee-canvas-toolbar ee-flex--row ee-align-main--center ee-align-cross--center', toolbarExpanded ? 'ee-canvas-toolbar--expanded' : ''].join(' ')}>
            <div className="ee-canvas-toolbar--current" style={{ backgroundColor: currentColorHex }} />

            <CanvasColorGrid colors={colors} pickColor={pickColor} />

            <CanvasTools tools={tools} activeToolId={activeToolId} />

            <CanvasTools tools={brushTools} activeToolId={activeBrushId} classname="ee-margin--right1" />
        </div>
    );
};

export default CanvasToolbar;
