import io from "socket.io-client";
import { useEffect } from "react";

const io=io.connect("http://localhost:8747/signalingserver");

io.