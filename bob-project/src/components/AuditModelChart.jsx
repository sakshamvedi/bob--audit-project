import { React, useState, useRef } from "react"
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
ChartJS.register(ArcElement, Tooltip, Legend);
import { Button } from "./ui/button"

import { IoAddCircleOutline, IoSparkles } from "react-icons/io5"
import {
    ShimmerButton,
    ShimmerTitle,
    ShimmerText,
    ShimmerCircularImage,
    ShimmerThumbnail,
    ShimmerBadge,
    ShimmerTableCol,
    ShimmerTableRow,
} from "react-shimmer-effects"
import pdfToText from "react-pdftotext"

function AuditModelChart(props) {
    const { propsdata } = props
    const [pdfAuditData, setPdfAuditData] = useState()
    const [cleanedData, setCleanedData] = useState();
    const [recommendation, setRecommendation] = useState([])
    const [findings, setFindings] = useState([])
    const [conclusion, setConclusion] = useState()
    const [isLoading, setIsLoading] = useState(false)
    const GPT4V_KEY = "c8581073488a45fb88bbb9c4c692bc61";
    const GPT4V_ENDPOINT = "https://auditreport.openai.azure.com/openai/deployments/Azure-AIModel/chat/completions?api-version=2024-02-15-preview";

    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [
            {
                data: [],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                ],
                borderWidth: 1,
            },
        ],
    });
    const [files, setFiles] = useState([]);
    const dropzoneRef = useRef(null);
    const dropzoneRefInput = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        dropzoneRef.current.classList.add('dragover');
    };

    const handleDragLeave = () => {
        dropzoneRef.current.classList.remove('dragover');
    };

    const handleDrop = (e) => {
        e.preventDefault();
        dropzoneRef.current.classList.remove('dragover');
        const newFiles = Array.from(e.dataTransfer.files);
        setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    };

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);
        setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    };

    const handleClick = () => {
        dropzoneRefInput.current.click();
        const newFiles = Array.from(e.target.files);
        setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    };
    async function extractPdfFromText() {
        if (pdfAuditData === undefined) {
            alert("Please upload a word file to analyze")
            return
        }
        const dataCleaning = `
        "Clean and format this resume text:
Remove extra whitespace and line breaks.
Correct capitalization and spelling errors.
Standardize section headings (e.g., SUMMARY, EXPERIENCE).
Format contact info clearly at the top.
Use consistent date and bullet point formatting.
Remove PDF extraction artifacts.
Ensure job titles, companies, and dates are on one line.
Standardize education and skills sections.
Preserve all important data and metrics.

Apply these rules to the following text:
${pdfAuditData}
Provide the cleaned version do not do formatting  ,  while maintaining the original content`

        try {
            const header = {
                "Content-Type": "application/json",
                "api-key": GPT4V_KEY,
            }

            const payload = {
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": ` 
    ${dataCleaning}
  `
                            }
                        ]
                    }
                ],
                "temperature": 0.7,
                "top_p": 0.95,
                "max_tokens": 800
            };

            const response = await fetch(GPT4V_ENDPOINT, {
                method: 'POST',
                headers: header,
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(response.status);
            }

            const data = await response.json();
            const contentString = data.choices[0].message.content;
            setCleanedData(contentString);
            setIsLoading(true)
            processAuditReport(contentString)
                .then(() => console.log("Analysis complete"))
                .catch((error) => console.error("Error in main execution:", error))
        } catch (error) {

        }


    }


    async function recommedationModel(text) {
        try {

            console.log(text);
            const analysisChecklist = `
     Analyze the following text and generate data for a chart. 
        Return the result as a JSON object with 'labels' and 'data' arrays. 
        The 'labels' should be categories or names, and 'data' should be corresponding numeric values.
        Text: ${text}
    Format the response as JSON with "labels"  , "data" arrays. Do not use any markdown formatting in your response.
  `
            const header = {
                "Content-Type": "application/json",
                "api-key": GPT4V_KEY,
            }

            const payload = {
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": ` 
    ${analysisChecklist}
  `
                            }
                        ]
                    }
                ],
                "temperature": 0.7,
                "top_p": 0.95,
                "max_tokens": 800
            };

            const response = await fetch(GPT4V_ENDPOINT, {
                method: 'POST',
                headers: header,
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(response.status);
            }

            const data = await response.json();
            console.log(data);
            const generatedText = data.choices[0].message.content;
            console.log(generatedText);
            const parsedResponse = JSON.parse(generatedText)
            console.log(parsedResponse);
            return {
                findings: parsedResponse.labels,
                recommendations: parsedResponse.data,

            }
        } catch (error) {
            console.error("Error generating or parsing AI response:", error)
            console.log("Raw AI response:", response.text())
            return {
                findings: ["Error generating findings"],
                recommendations: ["Error generating recommendations"],
            }
        }
    }

    async function extractText(event) {
        handleFileChange(event);
        const file = event.target.files[0]
        await pdfToText(file)
            .then((text) => {
                setPdfAuditData(text)
                console.log(text)
            })
            .catch((error) => console.error("Failed to extract text from pdf"))
    }

    async function processAuditReport(filePath) {
        try {
            // Read the audit report file
            const auditText = filePath

            // Perform AI-based analysis
            const { findings, recommendations, conclusion } =
                await recommedationModel(auditText)
            setIsLoading(false)
            setFindings(findings)
            setRecommendation(recommendations)
            setConclusion(conclusion)

            console.log(auditText)
            console.log("Audit Results:")
            console.log("Findings:")
            findings.forEach((finding, index) =>
                console.log(`${index + 1}. ${finding}`),
            )
            console.log("\nRecommendations:")
            recommendations.forEach((recommendation, index) =>
                console.log(`${index + 1}. ${recommendation}`),
            )
            console.log("\nConclusion:")
            console.log(conclusion)
        } catch (error) {
            console.error("Error processing audit report:", error)
        }
    }

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Audit Data',
            },
        },
    };



    return (
        <>
            <div className="App">
                <header className="App-headesr">

                    <div className="dropzone"
                        ref={dropzoneRef}
                        onClick={handleClick}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}>
                        <p>Drag & drop your files here, or click to select files</p>
                        <input type="file" id="fileInput" accept="application/pdf" ref={dropzoneRefInput} onChange={extractText} className="draganddrop" />
                    </div>
                    <ul className="file-list">
                        {files.map((file, index) => (
                            <li key={index}>{file.name}</li>
                        ))}
                    </ul>

                </header>

            </div>

            <div className="w-full flex width-full">
                <Button
                    className="btn my-10 flex btn-wide"
                    onClick={() => {
                        extractPdfFromText();
                    }}
                >
                    <IoSparkles size={20} /> Generate Findings
                </Button>
            </div>

            <Pie data={chartData} options={options} />


        </>
    )
}

export default AuditModelChart;
