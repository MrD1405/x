import {Server as SocketIoServer} from "socket.io";
import Message from "./models/MessagesModel.js";
import Channel from "./models/ChannelModel.js";

const roomId='EYYfy';
const state={
    'EYYfy':{
        players:{
          'xyz':{
            clientId:'xyz',
            x:400,
            y:300,
            name:'player1',
          }
        }
    }
};
const meetingRoom={
    offerer:{
        offererUserName:null,
        offer:null,
        offerIceCandidates:[],
    },
    answerer:{
        answererUserName:null,
        answer:null,
        answererIceCandidates:[]
    }

};
const players={};

const connectedSockets = {
    //username, socketId
}
const setupSocket = (server) => {
    const io = new SocketIoServer(server,{
        cors:{
            origin:process.env.ORIGIN,
            methods: ["GET", "POST"],
            credentials: true,
        },
    });
    const userSocketMap = new Map();

    const disconnect = (socket)=>{
        console.log("client disconnected");
        for(const [userId,socketId] of userSocketMap.entries()){
            if(socketId == socket.Id){
                userSocketMap.delete(userId);
                break;
            }
        }
    };

    const sendMessage = async (message)=>{

        const senderSocketId = userSocketMap.get(message.sender);
        const recipientSocketId  = userSocketMap.get(message.recipient);

        const createdMessage = await Message.create(message);

        const messageData = await Message.findById(createdMessage._id).populate("sender","id email firstName lastName image color")
                                .populate("recipient","id email firstName lastName image color");

        if(recipientSocketId){
            io.to(recipientSocketId).emit("recieveMessage", messageData);
        }
        if(senderSocketId){
            io.to(senderSocketId).emit("recievedMessage",messageData);
        }
    };

    const sendChannelMessage = async (message)=>{
        const {channelId, sender, content, messageType, fileUrl} = message;

        const createdMessage = await Message.create({sender,recipient: null, content,messageType, timestamp: new Date(), fileUrl,});

        const messageData = await Message.findById(createdMessage._id).populate("sender","id email firstName lastName image color").exec();

        await Channel.findByIdAndUpdate({
            $push: {messages: createdMessage._id},
        });

        const channel = await Channel.findById(channelId).populate(members);

        const finalData = {...messageData._doc,channelId: channel._id};

        if(channel && channel.members){
            channel.members.forEach((member)=>{
                const memberSocketId = userSocketMap.get(member._id.toString());
                if(memberSocketId){
                    io.to(memberSocketId).emit('recieve-channel-message', finalData);
                }
            });
            const adminSocketId = userSocketMap.get(member._id.toString());
            if(adminSocketId){
                    io.to(adminSocketId).emit('recieve-channel-message', finalData);
            }
        }

    };

    io.on("connection",(socket) => {
        const userId = socket.handshake.query.userId;

        if(userId){
            userSocketMap.set(userId,socket.id);
            console.log(`User connected: ${userId}`);
        }else{
            console.log("User ID not provided during connection");
        }
        socket.on("sendMessage", sendMessage);
        socket.on("send-channel-message", sendChannelMessage);
        socket.on("disconnect", ()=>disconnect(socket));

    });
    io.of("/player").on("connection",(socket)=>{
        socket.on("addMember",(data)=>{
            if(data===undefined)return;
            if(state[roomId].players[data.id]){
                const player=state[roomId].players[data.id];
                socket.emit('playerInfo',{clientId:player.clientId,x:player.x,y:player.y,name:data.firstName});
                socket.emit("allMembers",getPlayersData(roomId,data.id));
            }
            else{
                // console.log(data);
                const clientId=data.id;
                const {x,y,vel}=getPlayerInfo();
                socket.join(roomId);
                socket.emit("playerInfo",{clientId,x,y,name:data.firstName});//to sender
                socket.emit("allMembers",getPlayersData(roomId,clientId));//to sender
        
                state[roomId].players[clientId]={
                    clientId:clientId,
                    x:x,
                    y:y,
                    name:data.firstName,
                }
                socket.broadcast.emit("newMember",{clientId:clientId,x:x,y:y,name:data.firstName});// to all already present in the server except the sender
            }
        })
        
        socket.on("playerMovement",(data)=>{
            //console.log(data);
            socket.broadcast.emit("otherPlayerMovement",data);
        })

        // socket.on("joinMeetingRoom",(data,callback)=>{
        //     const clientId=data.id;
        //     const userName=data.firstName;
        //     meetingRoomAlpha[clientId]={
        //         userName:userName,
        //     }
        //     const noOfUsers=Object.keys(meetingRoomAlpha).length;
        //     callback(noOfUsers);
            
        // })
        // socket.on("leaveMeetingRoom",(data)=>{
        //     const {clientId}=data.id;
        //     delete meetingRoom[clientId];
        // })
        function getPlayerInfo(){
            const {x,y,vel}= {x:Math.floor(200*(Math.random())+200),y:Math.floor(100*(Math.random())+100),vel:{x:0,y:0}};
            return {x,y,vel};
        }
        function getPlayersData(roomId,clientId){
            if(!state[roomId])return {};
            if(state[roomId]){
                const players_map=state[roomId].players;
                const players_array=[];
                console.log("players_map-",players_map);
                for(const [id,player] of Object.entries(players_map)){
                    if(id!==clientId){
                        players_array.push(player)
                    }
                }
                console.log(players_array);
                return players_array;
            }
        }
    })
    io.of("/player").on("disconnect", (socket)=>{
        socket.broadcast.emit('playerDisconnected', state[roomId].players);
    });
    
    io.of("/signalingserver").on("connection",(socket)=>{
        
        const userName=socket.handshake.query.userName;
        connectedSockets[userName]=socket.id;
        socket.on('amIOffering',()=>{
            socket.emit('existingOffer',{
                offer:meetingRoom.offerer.offer,
                offerIceCandidates:meetingRoom.offerer.offerIceCandidates,
                offererUserName:meetingRoom.offerer.offererUserName,
            })
        })
        
        socket.on('offer',(data)=>{
            const {offer,offererUserName}=data;
            meetingRoom.offerer.offer=offer;
            meetingRoom.offerer.offererUserName=offererUserName;

        });
        socket.on('answer',(data)=>{
            const {answer,answererUserName}=data;
            meetingRoom.answerer.answer=answer;
            meetingRoom.answerer.answererUserName=answererUserName;
            socket.emit("receiveOffererIceCandidates",(meetingRoom.offerer.offerIceCandidates));
            
        });
        socket.on("iceCandidate",(data)=>{
            const { iceCandidate,userName,amIOffering}=data;
            if(amIOffering){
                
                if(meetingRoom.offerer.offererUserName===userName){
                    meetingRoom.offerer.offerIceCandidates.push(iceCandidate);
                    const socketToSendTo=connectedSockets[meetingRoom.answerer.answererUserName];
                    if(socketToSendTo){
                        socket.to(socketToSendTo).emit('receiveIceCandidateFromServer',iceCandidate);
                    }
                }
            }
            else{
                if(meetingRoom.answerer.answererUserName===userName){
                    meetingRoom.answerer.answererIceCandidates.push(iceCandidate);
                    const socketToSendTo=connectedSockets[meetingRoom.offerer.offererUserName];
                    if(socketToSendTo){
                        socket.to(socketToSendTo).emit('receiveIceCandidateFromServer',iceCandidate);
                    }
                }
            }
        })
        
         
        socket.on('disconnect',()=>{
            if(meetingRoom.offerer.offererUserName===userName){
                meetingRoom.offerer.offererUserName=null;
                meetingRoom.offerer.offer=null;
                meetingRoom.offerer.offerIceCandidates=[];
            }
            if(meetingRoom.answerer.answererUserName===userName){
                meetingRoom.answerer.answererUserName=null;
                meetingRoom.answerer.answer=null;
                meetingRoom.answerer.answerIceCandidates=[];
            }
            delete connectedSockets[userName];
            console.log("user disconnected");
        })
    })
    io.of("/signalingserver").on("disconnect",(socket)=>{
        const userName=socket.handshake.query.userName;
        if(meetingRoom.offerer.offererUserName===userName){
            meetingRoom.offerer.offererUserName=null;
            meetingRoom.offerer.offer=null;
            meetingRoom.offerer.offerIceCandidates=[];
        }
        if(meetingRoom.answerer.answererUserName===userName){
            meetingRoom.answerer.answererUserName=null;
            meetingRoom.answerer.answer=null;
            meetingRoom.answerer.answerIceCandidates=[];
        }
        delete connectedSockets[userName];
        console.log("user disconnected");
    })
};



export default setupSocket;