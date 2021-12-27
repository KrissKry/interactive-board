export type p2pEvent = 'QUERY' | 'OFFER' | 'OFFER_ANSWER' | 'ICE' | 'NEG_BEGIN' | 'NEG_RECV_OFFER' | 'NEG_RECV_ANS';

export interface p2pMessage {
    from: string;

    to: string;

    type: p2pEvent;

    data: any;
}
