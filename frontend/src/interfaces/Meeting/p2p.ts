export type p2pEvent = 'QUERY' | 'QUERY_ANSWER' | 'OFFER' | 'OFFER_ANSWER' | 'ICE' | 'NEGOTIATE_BEGIN';

export interface p2pMessage {
    from: string;

    to: string;

    type: p2pEvent;

    data: any;
}
