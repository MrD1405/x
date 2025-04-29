import {Server as SocketIoServer} from "socket.io";
import Message from "./models/MessagesModel.js";
import Channel from "./models/ChannelModel.js";

const roomId='EYYfy';
const state={
    'EYYfy':{
        players:[
          
        ]
    }
};
const players={};
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
            if(state[roomId].players.find((player)=>player.clientId===data.id)){
                const player=state[roomId].players.find((player)=>player.clientId===data.id);
                socket.emit('playerInfo',{clientId:player.clientId,x:player.x,y:player.y,name:data.firstName});
                socket.emit("allMembers",getPlayersData(roomId));
            }
            else{
            console.log(data);
            const clientId=data.id;
            const {x,y,vel}=getPlayerInfo();
            socket.join(roomId);
            socket.emit("playerInfo",{clientId,x,y,name:data.firstName});//to sender
            socket.emit("allMembers",getPlayersData(roomId));//to sender
    
            state[roomId].players.push({
                clientId:clientId,
                x:x,
                y:y,
                name:data.firstName,
            })
            socket.to(roomId).emit("newMember",[clientId,x,y,data.firstName]);// to all already present in the server except the sender
            }
        })
        
        socket.on("playerMovement",(data)=>{
            console.log(data);
            socket.to(roomId).emit("otherPlayerMovement",data);
        })
        function getPlayerInfo(){
            const {x,y,vel}= {x:Math.floor(200*(Math.random())+200),y:Math.floor(100*(Math.random())+100),vel:{x:0,y:0}};
            return {x,y,vel};
        }
        function getPlayersData(roomId){

            if(state[roomId])return state[roomId].players;
        }
    })
    io.of("player").on("disconnect", (socket)=>{
        socket.broadcast.emit('playerDisconnected', state[roomId].players);
    });
    io.of("media").on("connection",(socket)=>{
        
    })
};



export default setupSocket;