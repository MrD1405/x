import React from 'react'
import { useRef,useEffect ,useState} from 'react';
import {Avatar, AvatarImage} from "@/components/ui/avatar";
import { getColor } from '@/lib/utils';
import {Tooltip,TooltipContent,TooltipProvider,TooltipTrigger} from "@/components/ui/tooltip";
import { useAppStore } from '@/store';
import { useNavigate } from 'react-router-dom';
import { IoPowerSharp, IoChatbubbles} from 'react-icons/io5';
import { Button } from '@/components/ui/button';
import { FaMicrophone, FaVideo, FaVideoSlash, FaMicrophoneSlash } from 'react-icons/fa';
import setUpMedia ,{setUpPeerConnection}from '@/calls/setUpMedia';
import peerConfiguration from '@/calls/utils/stunServers';
import io from 'socket.io-client';
// import { use } from 'matter';

const Meetings = () => {

    const {userInfo,setUserInfo} = useAppStore();
    const [isAudioOn, setAudioOn] = useState(false);
    const [isVideoOn, setVideoOn] = useState(false);
    const [localStream,setLocalStream] = useState(null);
    const [remoteStream,setRemoteStream]=useState(null);
    const [peerConnection,setPeerConnection]=useState(null);
    const [amIOffering,setAmIOffering]=useState(true);
    const localVideoRef=useRef(null);
    const remoteVideoRef=useRef(null);
    const navigate = useNavigate();
    let mediaio=null;

    const handleLeaveClick = async ()=>{
        
    
    };

    const handleMicrophoneClick = async ()=>{
        //Add more functionality about mic on and off
        setAudioOn(!isAudioOn);
    };

    const handleVideoClick = async ()=>{
        //Add more functionality about video on and off
        setVideoOn(!isVideoOn);
    };
    useEffect(()=>{
        setMedia();
        setUpLocalStream(localStream);
        setRTCConnection();  
        
        //setUpPeerConnection(peerConnection,setPeerConnection,remoteStream,setRemoteStream);
        
    },[])
    function setUpLocalStream(stream){
        console.log("local stream",stream);
        localVideoRef.current.srcObject=stream;
        localVideoRef.current.autoplay = true;
        localVideoRef.current.muted = true;
    }
    function setRTCConnection(){
        mediaio=io.connect("http://localhost:8747/signalingserver");
        
        mediaio.on("existingOffers",(data)=>{
           if(data){
            establishPeerConnection();
            peerConnection.setRemoteDescription(data.offer);
            setAmIOffering(false);
            //add tracks to remoteVideo here
            peer.createAnswer().then((answer)=>{
                peer.setLocalDescription(answer);
                const offererIceCandidate=mediaio.emitwithAck("answer",{
                    answer,
                    answererUserName:userInfo.firstName,
                    amIOffering:amIOffering,
                });
                offererIceCandidate.forEach((iceCandidate)=>{
                    peer.addIce
                })
            })
            
           }

        })
        if(amIOffering){
            establishPeerConnection();
            
            localStream.getTracks().forEach((track)=>{
                peerConnection.addTrack(track,localStream);
            })
            peerConnection.createOffer().then((offer)=>{
                peerConnection.setLocalDescription(offer);
                mediaio.emit("offer",{
                    offer:offer,
                    offererUserName:userInfo.first
                });
            })
        }


    }
    function establishPeerConnection(){
        const peer=new RTCPeerConnection({
            peerConfiguration
        })
        setPeerConnection(peer);
        peer.onicecandidate=(event)=>{
            if(event.candidate){
                console.log("ice candidate",event.candidate);
                mediaio.emit("iceCandidate",{
                    candidate:event.candidate,
                    userName:userInfo.firstName,
                    amIOffering:amIOffering
                });
            }
        }
        peer.ontrack=(event)=>{
            console.log("remote stream",event.streams[0]);
            setRemoteStream(event.streams[0]);
            remoteVideoRef.current.srcObject=event.streams[0];
        }
        
    }
    async function setMedia(){
         
        const constraints = {
            video:{
                width:{ideal:1280},
                height:{ideal:720},
                frameRate:{ideal:30,max:60}
            },
            audio:true, 
        }
        try{
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            console.log(stream);
            setLocalStream(stream);
            
        }catch(err){
            console.log(err);
            
        }
    }
    useEffect(()=>{
        console.log("local stream",localStream);
        if(localStream){
            //const localVideo = document.querySelector(".localVideoStream");
            localVideoRef.current.srcObject=localStream;
            localVideoRef.current.autoplay = true;
            localVideoRef.current.muted = true;
        }
    },[localStream])
    return (
        <div className="bg-[#1b1c24] h-[100vh]">
            <div className="flex flex-col items-center content-between justify-around  h-[100vh]">
                <div className="grid grid-cols-2 grid-rows-1 gap-2 ">
                    <div className="">
                        <video className="localVideoStream" ref={localVideoRef} autoPlay muted>video is here</video>
                    </div>
                    <div className="remoteVideoStream" ref={remoteVideoRef}>Remote</div>
                </div>
                </div>
            <div className="absolute bottom-0 h-16 flex flex-row items-center justify-between px-10 w-full bg-[#2a2b33] gap-10">
                <div className="flex items-center justify-center gap-5">
                    <div className="flex gap-2 items-center justify-center">
                        <div className="w-10 h-10 relative">
                            <Avatar className="h-10 w-10 rounded-full overflow-hidden">
                                {
                                userInfo.image ? (<AvatarImage src={`${HOST}/${userInfo.image}`} alt="profile" className="object-cover w-full h-full bg-black" />
                                    ) : (
                                    <div className={`uppercase h-10 w-10  text-md border-[1px] flex items-center justify-center rounded-full ${getColor(userInfo.color)}`}>{
                                        userInfo.firstName ? userInfo.firstName.split("").shift() : userInfo.email.split("").shift()
                                    }</div> )
                                }
                            </Avatar>
                        </div>
                        <div className="text-md text-white/50 " >
                            {...userInfo.firstName && userInfo.lastName ? `${userInfo.firstName} ${userInfo.lastName}` : ""
                            }
                        </div>
                    </div>
                    <div className="flex  items-center justify-items-center gap-5">
                        <TooltipProvider className="flex items-center justify-items-center gap-5">
                            <Tooltip>
                                <TooltipTrigger className="flex items-center justify-items-center">
                                    {isAudioOn ? (<FaMicrophone className="text-white/50 text-4xl border-white/20 border-1 rounded-lg px-1 py-1" onClick={handleMicrophoneClick}/>) : (<FaMicrophoneSlash className="text-white/50 text-4xl border-white/20 border-1 rounded-lg px-1 py-1" onClick={handleMicrophoneClick}/>)}
                                </TooltipTrigger>
                                <TooltipContent className="bg-[#1c1b1e] border-none text-white">
                                    Audio
                                </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger className="flex items-center justify-items-center">
                                {isVideoOn ? (<FaVideo className="text-white/50 text-4xl border-white/20 border-1 rounded-lg px-1 py-1" onClick={handleVideoClick}/>) : (<FaVideoSlash className="text-white/50 text-4xl border-white/20 border-1 rounded-lg px-1 py-1" onClick={handleVideoClick}/>)}
                                </TooltipTrigger>
                                <TooltipContent className="bg-[#1c1b1e] border-none text-white">
                                    Video
                                </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger className="flex items-center justify-items-center">                                
                                    <Button className="text-white/50 text-sm border-white/20 border-1 bg-[#1b2c3e] rounded-lg px-1 py-1 " onClick = {handleLeaveClick}>
                                        Leave Meeting
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-[#1c1b1e] border-none text-white">
                                    Leave
                                </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger className="flex items-center justify-items-center">
                                    <IoChatbubbles className=" absolute right-15 text-white/50 text-4xl border-white/20 border-1 rounded-lg px-1 py-1" onClick = {()=> navigate("/chat")}/>
                                </TooltipTrigger>
                                <TooltipContent className="bg-[#1c1b1e] border-none text-white">
                                    Chat
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default Meetings;