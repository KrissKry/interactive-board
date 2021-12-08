export type p2pEvent = 'OFFER' | 'ANSWER' | 'ICE';

export interface p2pMessage {
    from: string;

    to: string;

    type: p2pEvent;

    data: any;
}
