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
const meetingRoomAlpha={};
const players={};
const offers = [
    // offererUserName
    // offer
    // offerIceCandidates
    // answererUserName
    // answer
    // answererIceCandidates
];
const connectedSockets = [
    //username, socketId
]
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
            socket.emit("allMembers",getPlayersData(roomId,clientId));//to sender
    
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

        socket.on("joinMeetingRoom",(data,callback)=>{
            const clientId=data.id;
            const userName=data.firstName;
            meetingRoomAlpha[clientId]={
                userName:userName,
            }
            const noOfUsers=Object.keys(meetingRoomAlpha).length;
            callback(noOfUsers);
            
        })
        socket.on("leaveMeetingRoom",(data)=>{
            const {clientId}=data.id;
            delete meetingRoomAlpha[clientId];
        })
        function getPlayerInfo(){
            const {x,y,vel}= {x:Math.floor(200*(Math.random())+200),y:Math.floor(100*(Math.random())+100),vel:{x:0,y:0}};
            return {x,y,vel};
        }
        function getPlayersData(roomId,clientId){

            if(state[roomId]){
                const players_array=state[roomId].players;
                    const player=players_array.find((player)=>player.clientId===clientId);
                    if(player){
                        players_array.splice(players_array.indexOf(player),1);
                    }
                return players_array;
            }
        }
    })
    io.of("/player").on("disconnect", (socket)=>{
        socket.broadcast.emit('playerDisconnected', state[roomId].players);
    });
    io.of("/media").on("connection",(socket)=>{
        //a new client has joined. If there are any offers available,
        //emit them out
        if(offers.length){
            socket.emit('availableOffers',offers);
        }
        
        socket.on('newOffer',newOffer=>{
            console.log("newOffer!")
            // console.log(newOffer)
            offers.push({
                offererUserName: userName,
                offer: newOffer,
                offerIceCandidates: [],
                answererUserName: null,
                answer: null,
                answererIceCandidates: []
            })
            // console.log(newOffer.sdp.slice(50))
            //send out to all connected sockets EXCEPT the caller
            console.log("Emmiting newOfferAwaiting")
            socket.broadcast.emit('newOfferAwaiting',offers.slice(-1))
        })

        socket.on('newAnswer',(offerObj,ackFunction)=>{
            // console.log(offerObj);
            console.log(connectedSockets)
            console.log("Requested offerer",offerObj.offererUserName)
            //emit this answer (offerObj) back to CLIENT1
            //in order to do that, we need CLIENT1's socketid
            const socketToAnswer = connectedSockets.find(s=>s.userName === offerObj.offererUserName)
            if(!socketToAnswer){
                console.log("No matching socket")
                return;
            }
            //we found the matching socket, so we can emit to it!
            const socketIdToAnswer = socketToAnswer.socketId;
            //we find the offer to update so we can emit it
            const offerToUpdate = offers.find(o=>o.offererUserName === offerObj.offererUserName)
            if(!offerToUpdate){
                console.log("No OfferToUpdate")
                return;
            }
            //send back to the answerer all the iceCandidates we have already collected
            ackFunction(offerToUpdate.offerIceCandidates);
            offerToUpdate.answer = offerObj.answer
            offerToUpdate.answererUserName = userName
            //socket has a .to() which allows emiting to a "room"
            //every socket has it's own room
            console.log(socketIdToAnswer)
            socket.to(socketIdToAnswer).emit('answerResponse',offerToUpdate)
        })

        socket.on('sendIceCandidateToSignalingServer',iceCandidateObj=>{
            const { didIOffer, iceUserName, iceCandidate } = iceCandidateObj;
            // console.log(iceCandidate);
            if(didIOffer){
                //this ice is coming from the offerer. Send to the answerer
                const offerInOffers = offers.find(o=>o.offererUserName === iceUserName);
                if(offerInOffers){
                    offerInOffers.offerIceCandidates.push(iceCandidate)
                    // 1. When the answerer answers, all existing ice candidates are sent
                    // 2. Any candidates that come in after the offer has been answered, will be passed through
                    if(offerInOffers.answererUserName){
                        //pass it through to the other socket
                        const socketToSendTo = connectedSockets.find(s=>s.userName === offerInOffers.answererUserName);
                        if(socketToSendTo){
                            socket.to(socketToSendTo.socketId).emit('receivedIceCandidateFromServer',iceCandidate)
                        }else{
                            console.log("Ice candidate recieved but could not find answere")
                        }
                    }
                }
            }else{
                //this ice is coming from the answerer. Send to the offerer
                //pass it through to the other socket
                const offerInOffers = offers.find(o=>o.answererUserName === iceUserName);
                const socketToSendTo = connectedSockets.find(s=>s.userName === offerInOffers.offererUserName);
                if(socketToSendTo){
                    socket.to(socketToSendTo.socketId).emit('receivedIceCandidateFromServer',iceCandidate)
                }else{
                    console.log("Ice candidate recieved but could not find offerer")
                }
            }
            // console.log(offers)
        })

        socket.on('disconnect',()=>{
            const offerToClear = offers.findIndex(o=>o.offererUserName === userName)
            offers.splice(offerToClear,1)
            socket.emit('availableOffers',offers);
        })
    })
};



export default setupSocket;