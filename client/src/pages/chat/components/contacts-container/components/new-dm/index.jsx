import React, { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FaPlus } from "react-icons/fa";
import { Dialog , DialogContent, DialogDescription, DialogTitle, DialogTrigger, DialogHeader} from "@/components/ui/dialog";
import { apiClient } from "@/lib/api-client";
import { SEARCH_CONTACTS_ROUTES } from "@/utils/constants";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import Lottie from "react-lottie";
import {Input} from "@/components/ui/input";
import { animationDefaultOptions } from "@/lib/utils";
import { useAppStore } from "@/store";
import { getColor } from "@/lib/utils";

const NewDM = () => {
    const {setSelectedChatType, setSelectedChatData} = useAppStore();
    const [openNewContactModal, setOpenNewContactModal] = useState(false);

    const [searchedContacts, setSearchedContacts] = useState([]);
    const searchContacts = async (searchTerm) => {
        try{
            if(searchTerm.length > 0){
                const response = await apiClient.post(SEARCH_CONTACTS_ROUTES, {searchTerm}, {withCredentials: true});
                if(response.status === 200 && response.data.contacts){
                    setSearchedContacts(response.data.contacts);
                    console.log(searchedContacts);
                }
            }else{
                setSearchedContacts([]);
            }
        }catch(error){
            console.log(error);
        }
    };

    const selectNewContact = (contact) => {
        setOpenNewContactModal(false);
        setSelectedChatType("contact");
        setSelectedChatData(contact);
        setSearchedContacts([]);
    };

    return (
    <>

        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>
                    <FaPlus className="text-neutral-400 font-light text-opacity-90 text text-start hover:text-neutral-100 cursor-pointer transition-all duration-300" onClick={()=> setOpenNewContactModal(true)}/>
                </TooltipTrigger>
                <TooltipContent className="bg-[#1c1b1e] border-none mb-2 p-3 text-white">
                    Select New Contact
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>

        <Dialog open = {openNewContactModal} onOpenChange={setOpenNewContactModal}>
            <DialogContent className="bg-[#181920] border-none text-white w-[400px] h-[400px] flex flex-col">
                <DialogHeader>
                <DialogTitle>Please select a contact</DialogTitle>
                <DialogDescription>
                    
                </DialogDescription>
                </DialogHeader>
                <div>
                   <Input placeholder="search contacts" className="rounded-lg p-6 bg-[#2c2e3b] border-none" onChange = {(e)=> searchContacts(e.target.value)} type="text"/>
                </div>
                {searchedContacts.length > 0 && (
                <ScrollArea className="h-[250px] ">
                    <div className="flex flex-col gap-5">
                        {
                            searchedContacts.map((contactInfo) => {
                                return (<div className="flex gap-3 items-center  cursor-pointer" key={contactInfo._id} onClick={()=>selectNewContact(contactInfo)}>
                                    <div className="w-12 h-12 relative">
                                    <Avatar className="h-12 w-12 rounded-full overflow-hidden">
                                        {
                                            contactInfo.image ? (<AvatarImage src={`${HOST}/${contactInfo.image}`} alt="profile" className="object-cover w-full h-full bg-black" />
                                                            ) : (
                                                            <div className={`uppercase h-12 w-12  text-lg border-[1px] flex items-center justify-center rounded-full ${getColor(contactInfo.color)}`}>{
                                                                contactInfo.firstName ? contactInfo.firstName.split("").shift() : contactInfo.email.split("").shift()
                                            }</div> )
                                        }
                                    </Avatar>
                                    </div>
                                    <div className="flex flex-col">
                                    <span>
                                    {contactInfo.firstName && contactInfo.lastName ? `${contactInfo.firstName} ${contactInfo.lastName}` : contactInfo.email
                                    }
                                    </span>
                                    <span className="text-xs"> {contactInfo.email}</span>
                                    </div>
                                </div>);
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

export default NewDM;