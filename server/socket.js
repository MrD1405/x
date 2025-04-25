import {Server as SocketIoServer} from "socket.io";
import Message from "./models/MessagesModel.js";
import Channel from "./models/ChannelModel.js";

const roomId='EYYfy';
let clientId=8989;
const state={
    'EYYfy':{
        players:[
          
        ]
    }
};
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
            // console.log(socket.id);
            if(data===undefined)return;
            const {x,y,vel}=getPlayerInfo();
            socket.join(roomId);
            socket.emit("playerInfo",{clientId,x,y,vel});
            socket.emit("allMembers",getPlayersData(roomId));//to sender
    
            state[roomId].players.push({
                clientId:clientId,
                x:x,
                y:y,
                vel:{x:0,y:0}
            })
            socket.to(roomId).emit("newMember",[clientId,x,y,vel]);// to all already present in the server except the sender
            clientId++; 
        })
        socket.on("playerMovement",(data)=>{
            console.log(data);
            socket.to(roomId).emit("otherPlayerMovement",data);
        })
    })
};
function getPlayerInfo(){
    const {x,y,vel}= {x:Math.floor(400*(Math.random())),y:Math.floor(200*(Math.random())),vel:{x:0,y:0}};
    return {x,y,vel};
}
function getAllMembers(){
    const room=io.sockets.clients(roomId);
}
function getPlayersData(roomId){
    const room =io.sockets.adapter.rooms.get(roomId);
    const players={};
    if(room)return state[roomId].players;
}


export default setupSocket;