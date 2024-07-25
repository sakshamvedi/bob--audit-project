import React from 'react';
import Webcam from "react-webcam";


function WebCam() {
    const [imageSrc, setImageSrc] = React.useState(null);

    const videoConstraints = {
        width: 1280,
        height: 720,
        facingMode: "user"
    };
    return (
        <>

        </>
    )
}

export default WebCam