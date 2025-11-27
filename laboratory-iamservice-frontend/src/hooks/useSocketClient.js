import { useEffect, useRef, useState } from 'react'
import SockJS from 'sockjs-client'
import { Client } from "@stomp/stompjs";
import { fetchReagentNotifications, fetchTestOrderNotifications } from '../services/fetchNotifications';
import { useSelector } from 'react-redux';

const websocket_host = import.meta.env.VITE_WEBSOCKET_HOST || "http://localhost:7070"

function useSocketClient() {
    const [testOrderNotification, setTestOrderNotification] = useState([])
    const [reagentNotification, setReagentNotification] = useState([])

    const clientRef = useRef(null)
    const { userInfo } = useSelector(state => state.user)


    useEffect(() => {
        const init = async () => {
            if (!userInfo) return;

            const testOrderData = await fetchTestOrderNotifications(userInfo.email);
            setTestOrderNotification(testOrderData?.data);

            const reagentData = await fetchReagentNotifications();
            if(userInfo.role === "ROLE_ADMIN" || userInfo.role === "ROLE_LAB_MANAGER") {
                setReagentNotification(reagentData?.data);
            }

            const socket = new SockJS(`${websocket_host}/ws`);

            clientRef.current = new Client({
                webSocketFactory: () => socket,
                onConnect: () => {
                    console.log("connected")
                    clientRef.current.subscribe(`/topic/notification/${userInfo.email}`, (msg) => {
                        const payload = JSON.parse(msg.body);
                        setTestOrderNotification(prev => [payload, ...prev]);
                    });

                    if (userInfo.role === "ROLE_ADMIN" || userInfo.role === "ROLE_LAB_MANAGER") {
                        clientRef.current.subscribe(`/topic/notification/reagent/alerts`, (msg) => {
                            const payload = JSON.parse(msg.body);
                            setReagentNotification(prev => [payload, ...prev]);
                        });
                    }
                },
            });

            clientRef.current.activate();
        };

        init();

        return () => {
            clientRef.current?.deactivate();
        };
    }, [userInfo]);


    return [testOrderNotification, reagentNotification]
}

export default useSocketClient
