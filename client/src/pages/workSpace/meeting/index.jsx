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
// import { use } from 'matter';

const Meetings = (callStatus,localStream,remoteStream,peerConnection) => {

    const {userInfo,setUserInfo} = useAppStore();
    const [isAudioOn, setAudioOn] = useState(false);
    const [isVideoOn, setVideoOn] = useState(false);
    const navigate = useNavigate();

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

    return (
        <div className="bg-[#1b1c24] h-[100vh]">
            <div className="grid">
                <div className="local"></div>
                <div className="remote"></div>
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