import { HOST } from "@/utils/constants";
import { createContext, useEffect, useRef , useContext, useState} from "react";
import { IoReturnUpBack } from "react-icons/io5";
import { useAppStore } from "@/store";
import {io,Socket} from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
    const socket = useContext(SocketContext);
    if (!socket) {
      throw new Error('useSocket must be used within a SocketProvider');
    }
    return socket;
  };

export const SocketProvider = ({children}) => {
    const [socket,setSocket] = useState(null);
    const {userInfo} = useAppStore.getState();
    useEffect(()=>{
        if(userInfo){
            const newSocket = io(HOST,{
                withCredentials: true,
                query: {userId: userInfo.id},
            });
            setSocket(newSocket);
            newSocket.on("connect",()=>{
                console.log("Connected to socket server");
            });

            const handleRecieveMessage = (message)=> {
                const {selectedChatData, selectedChatType, addMessage, addContactsInDMContacts} = useAppStore.getState();

                if(selectedChatType !== undefined && selectedChatData._id === message.sender._id || selectedChatData._id === message.recipient._id) {
                    addMessage(message);
                }
                addContactsInDMContacts(message);
            };

            const handleRecieveChannelMessage = (message) => {

                const {selectedChatData, selectedChatType, addMessage, addChannelInChannelList} = useAppStore.getState();
                if(selectedChatType !== undefined && selectedChatData._id === message.channelId){
                    addMessage(message);
                }
                addChannelInChannelList(message);
            };

            newSocket.on("recieveMessage", handleRecieveMessage);
            newSocket.on("recieve-channel-message",handleRecieveChannelMessage);

            return ()=> {
                newSocket.disconnect();
            }
        }
    },[userInfo]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    )
};