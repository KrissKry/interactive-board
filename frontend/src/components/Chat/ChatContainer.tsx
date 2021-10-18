import { IFrame } from '@stomp/stompjs';
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { ChatMessageInterface } from '../../interfaces/Meeting';
import { meetingAddMessage } from '../../redux/ducks/meeting';
import { MeetingService } from '../../services';
import { SimpleIonicInput } from '../Input';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';

interface ChatProps {
    title: string;

    // activeUsers: string[];

    // invitedUsers: string[];

    messages: ChatMessageInterface[];

    sendMessageCallback: (text: string) => void;
}
// const ChatContainer = ({ title, messages, sendMessageCallback } : ChatProps) : JSX.Element => {
const ChatContainer = () : JSX.Element => {
    const [subbed, setSubbed] = useState<boolean>(false);
    const meetingService = MeetingService.getInstance();
    const dispatch = useAppDispatch();
    const messages = useAppSelector((state) => state.meeting.messages);
    const title = useAppSelector((state) => state.meeting.name);
    // const user = useAppSelector((state) => state.meeting.)
    const user = 123;

    const chatUpdateCallback = (message: IFrame) => {
        const recvMessage: ChatMessageInterface = JSON.parse(message.body);
        dispatch(meetingAddMessage(recvMessage));
    };

    const sendMessageCallback = (text: string) => {
        const newMessage: ChatMessageInterface = {
            message: text,
            username: `${user}`,
        };

        meetingService.sendMessage(newMessage);
    };

    // useEffect(() => {
    //     setTimeout(() => {
    // eslint-disable-next-line max-len
    //         if (meetingService.client.connected) meetingService.addSubscription('/chat/listen', chatUpdateCallback);
    //     }, 1000);
    // }, []);
    console.log('hello motherfucker');
    useEffect(() => {
        setTimeout(() => {
            if (meetingService.client.connected && !subbed) {
                meetingService.addSubscription('/chat/listen', chatUpdateCallback);
                setSubbed(true);
            }
        }, 1000);
    }, [meetingService.client.connected]);

    return (
    <div className="ee-chat-container">
        <ChatHeader title={title} />

        <ChatMessages messages={messages} />

        <SimpleIonicInput sendCallback={sendMessageCallback} />
    </div>
);
};

export default ChatContainer;
