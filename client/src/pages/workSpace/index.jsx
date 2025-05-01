import React from 'react'
import { useRef,useEffect ,useState} from 'react';
import { PhaserGame } from '../../game/PhaserGame';
import {Avatar, AvatarImage} from "@/components/ui/avatar";
import { getColor } from '@/lib/utils';
import {Tooltip,TooltipContent,TooltipProvider,TooltipTrigger} from "@/components/ui/tooltip";
import { useAppStore } from '@/store';
import { useNavigate } from 'react-router-dom';
import { IoPowerSharp, IoChatbubbles} from 'react-icons/io5';
import { Button } from '@/components/ui/button';
import { enableJoin } from '@/game/scenes/Office';
import  setUpMedia ,{setUpPeerConnection} from '@/calls/setUpMedia';
// import { use } from 'matter';

const WorkSpace = () => {

  const [ callStatus, updateCallStatus ] = useState({})
  const [ localStream, setLocalStream ] = useState(null)
  const [ remoteStream, setRemoteStream ] = useState(null)
  const [ peerConnection, setPeerConnection ] = useState(null)
  const [ userName, setUserName ] = useState("")
  const [ offerData, setOfferData ] = useState(null)
  const {userInfo,setUserInfo} = useAppStore();
  // console.log(userInfo);
  

  const navigate = useNavigate();
  const joinButtonRef=useRef(null);
  const logOut = async ()=>{
    try{
      const response = await apiClient.post(LOGOUT_ROUTE,{},{withCredentials:true});
    
      if(response.status === 200){
          navigate("/auth");
          setUserInfo(null);
      }
    }catch(error){
      console.log(error);
    }
  };
  useEffect(()=>{
    async function settingUp(){
      await setUpMedia(callStatus,updateCallStatus,setLocalStream);
    }
    settingUp();
  },[userName]);

  useEffect(()=>{
    
    setUserName(userInfo.firstName);
    joinButtonRef.current.classList.remove("invisible");
    if(!enableJoin){
      joinButtonRef.current.classList.add("invisible");
    }
    
  },[enableJoin]);
  const handleJoinClick = async ()=>{
    //Check on click event in join meeting button...
    setUpPeerConnection(callStatus.haveMedia,peerConnection,setPeerConnection,remoteStream,setRemoteStream);
  
  };

  return (
    <div className="bg-[#1b1c24] h-[100vh] flex items-center justify-center flex-col gap-10"> 
      <div>
        <PhaserGame />
      </div>
      <div className="absolute bottom-0 h-16 flex flex-row items-center justify-between px-10 w-full bg-[#2a2b33]">
        <div className="flex items-center justify-center">
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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="flex items-center justify-items-center">
                  <Button className="invisible absolute ml-3 text-white/50 text-sm border-white/20 border-1 bg-[#1b2c3e] rounded-lg px-1 py-1 " ref={joinButtonRef} onClick = {()=>{handleJoinClick();navigate("/meetings",{
                      state: {
                      callStatus: callStatus,
                      localStream: localStream,
                      remoteStream: remoteStream,
                      peerConnection: peerConnection,
                      },
                  });}}>Join Meeting</Button>
                </TooltipTrigger>
                <TooltipContent className="bg-[#1c1b1e] border-none text-white">
                    Join
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
              <Tooltip>
                <TooltipTrigger className="flex items-center justify-items-center">
                  <IoPowerSharp className="absolute right-2 text-red-500 text-4xl font-medium  border-white/20 border-1 rounded-lg px-1 py-1" onClick = {logOut}/>
                </TooltipTrigger>
                <TooltipContent className="bg-[#1c1b1e] border-none text-white">
                  LogOut
                </TooltipContent>
              </Tooltip>
                      
            </TooltipProvider>
          </div>
      </div>
    </div>
    </div>
  )
}

export default WorkSpace;