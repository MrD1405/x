import { io } from "socket.io-client";
import React from 'react'
import createPeerConnection from "./utils/createPeerConn";
const setUpMedia = (callStatus,updateCallStatus,setLocalStream)=>{
    return new Promise(async(resolve, reject)=>{
        //can bring constraints in as a param
        const constraints = {
            video: true, //must have one constraint, dont have to show it yet
            audio: false, 
        }
        try{
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            //update bools
            const copyCallStatus = {...callStatus}
            copyCallStatus.haveMedia = true //signals to the app that we have media
            copyCallStatus.videoEnabled = null //init both to false, you can init to true
            copyCallStatus.audioEnabled = false
            updateCallStatus(copyCallStatus)
            setLocalStream(stream)
            resolve()
        }catch(err){
            console.log(err);
            reject(err)
        }
    })
}

export const setUpPeerConnection=(haveMedia,peerConnection,setPeerConnection,remoteStream,setRemoteStream)=>{
    if(callStatus.haveMedia && !peerConnection){
        // prepForCall has finished running and updated callStatus
        const { peerConnection, remoteStream } = createPeerConnection(userName,typeOfCall)
        setPeerConnection(peerConnection)
        setRemoteStream(remoteStream)
    }
}

export default setUpMedia;