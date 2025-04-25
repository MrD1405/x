import React, { useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FaPlus } from "react-icons/fa";
import { Dialog , DialogContent, DialogDescription, DialogTitle,  DialogHeader} from "@/components/ui/dialog";
import { apiClient } from "@/lib/api-client";
import { CREATE_CHANNEL_ROUTE, GET_ALL_CONTACTS_ROUTES} from "@/utils/constants";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import Lottie from "react-lottie";
import {Input} from "@/components/ui/input";
import { animationDefaultOptions } from "@/lib/utils";
import { useAppStore } from "@/store";
import MultipleSelector from "@/components/ui/multipleselect";

const CreateChannel = () => {
    const {setSelectedChatType, setSelectedChatData,addChannel} = useAppStore();
    const [newChannelModal, setNewChannelModal] = useState(false);

    const [searchedContacts, setSearchedContacts] = useState([]);
    const [allContacts, setAllCOntacts] = useState([]);
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [channelName,setChannelName] = useState("");

    useEffect(()=>{
        const getData = async ()=> {
            const response = await apiClient.get(GET_ALL_CONTACTS_ROUTES, {withCredentials: true});
            setAllCOntacts(response.data.contacts);
        };
        getData();
    },[]);


    const createChannel = async () => {
        try{
            if(channelName.length > 0 && selectedContacts.length > 0){
                const response = await apiClient.post(CREATE_CHANNEL_ROUTE,{name: channelName, members: selectedContacts.map((contact) => contact.value) }, {withCredentials: true});
                if(response.status === 201){
                    setChannelName("");
                    setSelectedContacts([]);
                    setNewChannelModal(false);
                    addChannel(response.data.channel);
                }
            }

        }catch(error){

        }
    };

    return (
    <>

        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>
                    <FaPlus className="text-neutral-400 font-light text-opacity-90 text text-start hover:text-neutral-100 cursor-pointer transition-all duration-300" onClick={()=> setNewChannelModal(true)}/>
                </TooltipTrigger>
                <TooltipContent className="bg-[#1c1b1e] border-none mb-2 p-3 text-white">
                    Create New Channel
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>

        <Dialog open = {newChannelModal} onOpenChange={setNewChannelModal}>
            <DialogContent className="bg-[#181920] border-none text-white w-[400px] h-[400px] flex flex-col">
                <DialogHeader>
                <DialogTitle>Please fill up details for new channel</DialogTitle>
                <DialogDescription>
                    
                </DialogDescription>
                </DialogHeader>
                <div>
                   <Input placeholder="Channel Name" className="rounded-lg p-6 bg-[#2c2e3b] border-none" onChange = {(e)=> setChannelName(e.target.value)} type="text" value={channelName}/>
                </div>
                <div>
                    <MultipleSelector  className="rounded-lg bg-[#2c2e3b] border-none py-2 text-white" defaultOptions={allContacts} placeholder="Search Contacts" value={selectedContacts} onChange={setSelectedContacts} emptyIndicator = {
                         <p className="text-center text-lg leading-10 text-gray-600"> No results found.</p> }/>
                </div>
                <div>
                    <button className="w-full bg-purple-700 hover:bg-purple-900 transition-all duration-300" onClick={createChannel}>
                        Create Channel
                    </button>
                </div>
                { searchedContacts.length > 0 && (
                <ScrollArea className="h-[250px] ">
                    <div className="flex flex-col gap-5">
                        {
                            searchedContacts.map((contact) => {
                                (<div className="flex gap-3 items-center  cursor-pointer" key={contact.id} onClick={()=>selectNewContact(contact)}>
                                    <div className="w-12 h-12 relative">
                                    <Avatar className="h-12 w-12 rounded-full overflow-hidden">
                                        {
                                            contact.image ? (<AvatarImage src={`${HOST}/${contact.image}`} alt="profile" className="object-cover w-full h-full bg-black" />
                                                            ) : (
                                                            <div className={`uppercase h-12 w-12  text-lg border-[1px] flex items-center justify-center rounded-full ${getColor(contact.color)}`}>{
                                                                contact.firstName ? contact.firstName.split("").shift() : contact.email.split("").shift()
                                            }</div> )
                                        }
                                    </Avatar>
                                    </div>
                                    <div className="flex flex-col">
                                    <span>
                                    {contact.firstName && contact.lastName ? `${contact.firstName} ${contact.lastName}` : contact.email
                                    }
                                    </span>
                                    <span className="text-xs"> {contact.email}</span>
                                    </div>
                                </div>)
                            })
                        }
                    </div>
                </ScrollArea> ) 
                }
                {
                    searchedContacts.length <= 0 && 
                        (<div className="flex-1 md:flex mt-5 md:mt-0 flex-col justify-center items-centerduration-1000 transition-all">
                            <Lottie  isClickToPauseDisable={true} height={100} width={100} options={animationDefaultOptions} />
                            <div className="text-opacity-80 text-white flex flex-col gap-5 items-center mt-5 lg:text-2xl text-xl transition-all duration-300 text-center">
                                <h3 className="poppins-medium">
                                    Hi <span className="text-purple-500">!</span>
                                    Search New Contact 
                                </h3>
                            </div>
                        </div>)
                }
            </DialogContent>
        </Dialog>

    </>
)};

export default CreateChannel;