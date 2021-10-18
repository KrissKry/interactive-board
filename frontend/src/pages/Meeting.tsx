import React from 'react';
import { useDispatch } from 'react-redux';
import Canvas from '../components/Canvas';

const Meeting = () => {
    const dispatch = useDispatch();

    return (
        <div>
            <Canvas brushWidth={1} />
        </div>
    );
};
