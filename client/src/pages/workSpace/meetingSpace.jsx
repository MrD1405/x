import setUpMedia ,{setUpPeerConnection}from '@/calls/setUpMedia';
import React, { useEffect } from 'react'
import { useRef,useState } from 'react';
import { useNavigate } from 'react-router-dom';
import peerConfiguration from '@/calls/utils/stunServers';
const MeetingSpace = () => {
    const OfferWindow=useRef(null);
    const answerWindow=useRef(null);
    const navigate = useNavigate();
    // const [ callStatus, updateCallStatus ] = useState({})
    const [ localStream, setLocalStream ] = useState(null)
    const [ remoteStream, setRemoteStream ] = useState(null)
    const [ peerConnection, setPeerConnection ] = useState(null)
    const [ userName, setUserName ] = useState("")
    const [ offerData, setOfferData ] = useState(null);
    const [ videoMessage, setVideoMessage ] = useState("Please enable video to start!")
    const [ answerCreated, setAnswerCreated ] = useState(false)
    useEffect(()=>{
        async function setUp(){
            await setUpMedia(setLocalStream);
        }
        setUp();
        const localVideo = document.getElementById("localVideo");
        OfferWindow.srcObject = localStream;
              

    },[])
function handleCall(){
    console.log("i am calling");
    // if(localStream.getVideoTracks().length>0){
    //     console.log(`Using video device: ${localStream.getVideoTracks()[0].label}`);
    // }
    // if(localStream.getAudioTracks().length>0){
    //     console.log(`Using audio device: ${localStream.getVideoTracks()[0].label}`);
    // }
    const localPeerConnection = new RTCPeerConnection({
        peerConfiguration,
    });
    setPeerConnection(localPeerConnection);
    peerConnection.onicecandidate=gotLocalIceCandidate;
    peerConnection.onaddstream=gotRemoteStream;
    peerConnection.addStream(localStream);
    peerConnection.createOffer().then(gotLocalDescription);
    }
    function gotRemoteStream(event){
        answerWindow.srcObject=event.stream;
    }
    function gotLocalDescription(offer){
        peerConnection.setLocalDescription(offer);
    }
   function gotLocalIceCandidate(event){
        if(!event.candidate){
            const offer=peerConnection.localDescription;
        }
   }
  return (
    <div>
        <button  className='bg-blue-500 text-white p-2 rounded-md' onClick={handleCall}>Call</button>
        <button  className='bg-green-500 text-white p-2 rounded-md'onClick={answerCall} >Answer</button>
        <div   className='w-full h-full flex items-center justify-center'>
            <video id="remoteVideo" ref={OfferWindow} autoPlay className='w-full h-full'></video>
            <video id="localVideo" ref={answerWindow} autoPlay className='w-full h-full'></video>
        </div>

    </div>
  )
}

export default MeetingSpace