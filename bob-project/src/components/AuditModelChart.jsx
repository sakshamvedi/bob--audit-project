import { React, useState, useRef } from "react"
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, layouts } from 'chart.js';
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
        labels: [findings, recommendation],
        datasets: [
            {
                data: recommendation,
                backgroundColor: [
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
    Analyze the following audit text and generate data for a pie chart. Follow these strict guidelines:

    1. Identify 5 to 7 key audit areas or findings from the text.
    2. For each area, assign a numeric value based on its significance or frequency in the audit report. Use a scale of 1-100, where higher numbers indicate greater significance.
    3. Return ONLY a valid JSON object with two arrays: 'labels' for audit areas and 'data' for corresponding significance values.
    4. The JSON structure must be exactly as follows:
       {
         "labels": ["Audit Area 1", "Audit Area 2", "Audit Area 3", ...],
         "data": [value1, value2, value3, ...]
       }
    5. Ensure all values in the 'data' array are numbers between 1 and 100.
    6. Do not include any explanations, markdown, or additional text outside the JSON object.

    Audit text to analyze:
    ${text}

    Remember, your entire response must be a valid JSON object and nothing else. Do not use any markdown formatting in your response.`;
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
                labels: parsedResponse.labels,
                data: parsedResponse.data,
            }
        } catch (error) {
            console.error("Error generating or parsing AI response:", error)
            console.log("Raw AI response:", response.text())
            return {
                labels: ["Error generating findings"],
                data: ["Error generating recommendations"],
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
            const { labels, data } =
                await recommedationModel(auditText)

            console.log(labels)
            console.log(data);
            setIsLoading(false)
            setFindings(labels)
            setRecommendation(data)
            console.log(labels)
            console.log(data)
            const totalItems = labels.length;
            const colors = generateRandomColors(totalItems);
            setChartData({
                labels: labels,
                datasets: [{

                    data: data,
                    backgroundColor: colors.map(color => color[0]),
                }],
            });
            console.log(auditText);
        } catch (error) {
            console.error("Error processing audit report:", error)
        }
    }

    function generateRandomColors(count) {
        const generateColor = () => {
            const r = Math.floor(Math.random() * 256);
            const g = Math.floor(Math.random() * 256);
            const b = Math.floor(Math.random() * 256);
            return [`rgba(${r}, ${g}, ${b}, 0.7)`, `rgba(${r}, ${g}, ${b}, 1)`];
        };

        return Array.from({ length: count }, generateColor);
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
            <div className="pie-chart">
                <Pie data={chartData} options={options} />
            </div>


        </>
    )
}

export default AuditModelChart;
