import React from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import WebCam from './ui/WebCam';
const genAi = new GoogleGenerativeAI("AIzaSyBI5B23RXprsQeqPuER3xVzFDzmp8-ZM28");
const model = genAi.getGenerativeModel({ model: "gemini-1.5-flash" })
import Webcam from "react-webcam";
import { Button } from './ui/button';
function CorbonDetector() {
    const [imageSrc, setImageSrc] = React.useState("./crocod.png");

    const videoConstraints = {
        width: 1280,
        height: 720,
        facingMode: "user"
    };
    async function generateCorbonFootprint() {
        const prompt = `Analyze the image and provide the following information:

1. Identify the main object or activity in the image.

2. Environmental Impact:
   - Estimate the percentage this item/activity contributes to an average person's daily carbon footprint.

3. Proper Disposal:
   - If it's an object, provide step-by-step instructions for its correct disposal or recycling.
   - If it's an activity, explain how to modify it to reduce its environmental impact.

4. Impact Reduction:
   - Suggest one simple way to reduce the environmental impact of this item/activity.
   - Estimate the percentage of impact that could be reduced by following this suggestion.

Please present this information concisely and clearly, focusing on percentages and practical disposal or reduction methods.`;
        const image = {
            inlineData: {
                data: imageSrc.split(',')[1],
                mimeType: 'image/jpeg',
            },
        };

        const result = await model.generateContent([prompt, image]);
        const response = result.response;
        console.log(response.text());

    }

    return (

        <>
            <Webcam
                audio={false}
                height={720}
                screenshotFormat="image/jpeg"
                width={1280}
                videoConstraints={videoConstraints}
            >
                {({ getScreenshot }) => (
                    <Button className='m-20'
                        onClick={() => {
                            const imageSrc = getScreenshot()
                            setImageSrc(imageSrc);
                            console.log(imageSrc)
                        }}
                    >
                        Capture photo
                    </Button>
                )}
            </Webcam >
            <Button className='mx-20' onClick={generateCorbonFootprint}>Generate</Button>
            <img src={imageSrc} />
        </>
    )
}

export default CorbonDetector