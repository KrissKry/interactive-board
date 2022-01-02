import React from 'react';
import { IonIcon } from '@ionic/react';
import { CanvasTool } from '../../interfaces/Canvas';

interface ToolsProps {
    activeToolId: string;

    tools: CanvasTool[];
}

const CanvasTools = ({ activeToolId, tools }: ToolsProps) : JSX.Element => (
    <div className="">
        {tools.map((item, index) => (
            <button
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                type="button"
                title={item.id}
                onClick={item.callback}
                className={['ee-canvas-toolbar--tool', item.customClass].join(' ')}
            >
                <IonIcon
                    icon={item.icon}
                    title={item.id}
                    className={['ee-canvas-toolbar--icon', item.id === activeToolId || item.customId === activeToolId ? 'ee-canvas-toolbar--icon-active' : ''].join(' ')}
                />
            </button>
        ))}
    </div>
);

export default CanvasTools;
