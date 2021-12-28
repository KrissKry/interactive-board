import { IonItem } from '@ionic/react';
import React from 'react';
import { useInView } from 'react-intersection-observer';

interface ChildProps {
    children?: React.ReactNode;
}

const VirtualScrollChild = ({ children } : ChildProps) : JSX.Element => {
    const [ref, inView] = useInView();

    return (
        <IonItem ref={ref}>
            {inView ? children : null}
        </IonItem>
    );
};

VirtualScrollChild.defaultProps = {
    children: undefined,
};

export default VirtualScrollChild;
