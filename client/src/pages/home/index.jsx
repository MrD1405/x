import React from 'react'
import { PhaserGame } from '../../game/PhaserGame';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { useAppStore } from '@/store';
import { getColor } from '@/lib/utils';
import { IoChatbubbles, IoPowerSharp } from "react-icons/io5";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useNavigate } from 'react-router-dom';
import window_tempate from "@/assets/window_template.jpg";
import {Card,CardContent,CardDescription,CardFooter,CardHeader,CardTitle,} from "@/components/ui/card"
import { apiClient } from "@/lib/api-client.js";
import { LOGOUT_ROUTE } from '@/utils/constants';

const Home = () => {

    const {userInfo, setUserInfo} = useAppStore();
    const navigate = useNavigate();
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


  return (
    <div className="bg-[#1b1c24] h-[100vh] flex flex-col gap-10"> 
        <div className="absolute top-0 h-16 flex flex-row items-center justify-between px-10 w-full bg-[#2a2b33]">
            <div className="flex gap-3 items-center justify-center">
                <div className="w-12 h-12 relative">
                <Avatar className="h-10 w-10 rounded-full overflow-hidden">
                    {
                        userInfo.image ? (<AvatarImage src={`${HOST}/${userInfo.image}`} alt="profile" className="object-cover w-full h-full bg-black" />
                                        ) : (
                                        <div className={`uppercase h-10 w-10  text-lg border-[1px] flex items-center justify-center rounded-full ${getColor(userInfo.color)}`}>{
                                            userInfo.firstName ? userInfo.firstName.split("").shift() : userInfo.email.split("").shift()
                        }</div> )
                    }
                </Avatar>
                </div>
                <div className="text-xl text-white/50 justify-items-center" >
                    {...userInfo.firstName && userInfo.lastName ? `${userInfo.firstName} ${userInfo.lastName}` : ""
                    }
                </div>
                <div className="absolute right-2 flex justify-items-center">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <IoPowerSharp className="text-red-500 text-2xl font-medium " onClick = {logOut}/>
                        </TooltipTrigger>
                        <TooltipContent className="bg-[#1c1b1e] border-none text-white">
                            LogOut
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                </div>
                <div className="absolute right-7 flex justify-items-center text-2xl mr-3">
                    <IoChatbubbles className="text-white/50" onClick = {()=> navigate("/chat")}/>
                </div>
            </div>
        </div>
        <div className="relative top-20 flex items-start justify-items-start mt-5 ml-5" onClick={()=> navigate("/workspace")}>
        <Card className="h-[40vh] w-[40vw] border-[#2a2b33] bg-[#1c1b1e] text-white/50 pt-3">
            <CardHeader>
                <CardTitle>My workspace</CardTitle>
            </CardHeader>
            <CardContent>
            <img src={window_tempate} alt="My workspace" className="h-[30vh] w-[30vw] border-3 border-[#2a2b33] flex ml-1.5 rounded-sm" />
            </CardContent>
            </Card>
        </div>
    </div>
  )
}

export default Home;