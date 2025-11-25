import { useEffect, useRef, useState } from 'react'
import SockJS from 'sockjs-client'
import { Client } from "@stomp/stompjs";
import fetchNotifications from '../services/fetchNotifications';
import { useSelector } from 'react-redux';

const websocket_host = import.meta.env.VITE_WEBSOCKET_HOST || "http://localhost:7070"

function useSocketClient() {
    const [notifications, setNotifications] = useState([])
    const clientRef = useRef(null)
    const { userInfo } = useSelector(state => state.user)


    useEffect(() => {
        const init = async () => {
            if (!userInfo) return;

            const data = await fetchNotifications(userInfo.email);
            setNotifications(data.data);

            const socket = new SockJS(`${websocket_host}/ws`);

            clientRef.current = new Client({
                webSocketFactory: () => socket,
                onConnect: () => {
                    console.log("connected")
                    clientRef.current.subscribe(`/topic/notification/${userInfo.email}`, (msg) => {
                        const payload = JSON.parse(msg.body);
                        setNotifications(prev => [payload, ...prev]);
                    });
                },
            });

            clientRef.current.activate();
        };

        init();

        return () => {
            clientRef.current?.deactivate();
        };
    }, [userInfo]);


    return notifications
}

export default useSocketClient
