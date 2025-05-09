import { io } from "socket.io-client";
import React from 'react'
//import {createPeerConnection} from './utils/createPeerConnection';
const setUpMedia = (localStream,setLocalStream)=>{
    return new Promise(async(resolve, reject)=>{
        
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
            localStream=stream;
            
           
            resolve();
        }catch(err){
            console.log(err);
            reject(err)
        }
    })
}

export const setUpPeerConnection=(peerConnection,setPeerConnection,remoteStream,setRemoteStream)=>{
    if(!peerConnection){
        const { peerConnection, remoteStream } = createPeerConnection(userName,typeOfCall)
        setPeerConnection(peerConnection)
        setRemoteStream(remoteStream)
    }
}

export default setUpMedia;