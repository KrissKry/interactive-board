export type p2pEvent = 'QUERY' | 'QUERY_ANSWER' | 'OFFER' | 'OFFER_ANSWER' | 'ICE' | 'NEG_SYN' | 'NEG_SYN_ACK' | 'NEG_ACK';

export interface p2pMessage {
    from: string;

    to: string;

    type: p2pEvent;

    data: any;
}
