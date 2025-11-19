import { useEffect, useRef, useState } from 'react'
import SockJS from 'sockjs-client'
import { Client } from "@stomp/stompjs";
import fetchNotifications from '../services/fetchNotifications';
import { useSelector } from 'react-redux';

const formatDate = (dateString) => {
    if (!dateString || isNaN(Date.parse(dateString))) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN");
}

function useSocketClient() {
    const [notifications, setNotifications] = useState([])
    const clientRef = useRef(null)
    const { userInfo } = useSelector(state => state.user)


    useEffect(() => {
        const init = async () => {
            if (!userInfo) return;

            const data = await fetchNotifications(userInfo.email);
            setNotifications(data.data);

            const socket = new SockJS("http://localhost:9090/ws");

            clientRef.current = new Client({
                webSocketFactory: () => socket,
                onConnect: () => {
                    clientRef.current.subscribe("/topic/notification", (msg) => {
                        const payload = JSON.parse(msg.body);
                        if(payload.email === userInfo.email){
                            setNotifications(prev => [...prev, payload]);
                        }else{
                            console.log("Notification ignore because different email")
                        }  
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
