import { React, useState } from "react"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { Button } from "./ui/button"

import { IoSparkles } from "react-icons/io5"
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
function AuditModel(props) {
    const { propsdata } = props
    const [pdfAuditData, setPdfAuditData] = useState()
    const [cleanedData, setCleanedData] = useState();
    const [recommendation, setRecommendation] = useState([])
    const [findings, setFindings] = useState([])
    const [conclusion, setConclusion] = useState()
    const [isLoading, setIsLoading] = useState(false)
    const genAI = new GoogleGenerativeAI(
        "Api",
    )

    async function analyzeAuditReport() {
        if (pdfAuditData === undefined) {
            alert("Please upload a pdf file to analyze")
            return
        }
        const model = genAI.getGenerativeModel({ model: "gemini-pro" })


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
            const result = await model.generateContent(dataCleaning);
            const response = result.response;
            let generatedText = response.text();
            generatedText = generatedText.replace(/```json\n?|\n?```/g, "").trim()
            console.log(generatedText);
            setCleanedData(generatedText);
            setIsLoading(true)
            processAuditReport(generatedText)
                .then(() => console.log("Analysis complete"))
                .catch((error) => console.error("Error in main execution:", error))
        } catch (error) {

        }


    }


    async function recommedationModel(text) {

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `
    As an expert HR resume auditor & Reviewer , analyze the following employee resume and provide:
    1. Key findings (list 5 main points)
    2. Recommendations for improvement (list 5 suggestions)
    3. Conclusion based on the audit findings that in which role the resume is suited to work.

    Audit Report:
    ${text}

    Format the response as JSON with "findings"  , "recommendations"  , "conclusion" arrays. Do not use any markdown formatting in your response.
  `

        try {
            const result = await model.generateContent(prompt)
            const response = result.response
            let generatedText = response.text()

            // Clean up the response: remove any markdown formatting
            generatedText = generatedText.replace(/```json\n?|\n?```/g, "").trim()
            console.log(generatedText);
            const parsedResponse = JSON.parse(generatedText)
            console.log(parsedResponse);
            return {
                findings: parsedResponse.findings,
                recommendations: parsedResponse.recommendations,
                conclusion: parsedResponse.conclusion,
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

    // const textData = { data }

    // Usage
    // processAuditReport(textData)
    //     .then(() => console.log('Analysis complete'))
    //     .catch(error => console.error('Error in main execution:', error));
    return (
        <>
            <Button
                className="btn my-10 flex"
                onClick={() => {
                    analyzeAuditReport();
                }}
            >
                <IoSparkles size={20} /> Generate Findings
            </Button>

            <div class="table-container">
                <table class="audit-table">
                    <thead>
                        <tr>
                            <th>Findings</th>
                            <th className="black">Recommendations</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <ul className="table-data">
                                    {isLoading ? (
                                        <div className="shimmer-effect">
                                            {" "}
                                            <ShimmerButton size="sm" />
                                            <ShimmerButton size="md" />
                                            <ShimmerButton size="lg" />
                                        </div> // Replace this with your actual shimmer effect
                                    ) : (
                                        findings.map((finding, index) => {
                                            return (
                                                <li key={index} className="btn flex">
                                                    {" "}
                                                    <b className="bold">{index + 1}.</b> {finding}
                                                </li>
                                            )
                                        })
                                    )}
                                </ul>
                            </td>
                            <td>
                                <ul className="table-data">
                                    {isLoading ? (
                                        <div className="shimmer-effect">
                                            {" "}
                                            <ShimmerButton size="sm" />
                                            <ShimmerButton size="md" />
                                            <ShimmerButton size="lg" />
                                        </div> // Replace this with your actual shimmer effect
                                    ) : (
                                        recommendation.map((finding, index) => {
                                            return (
                                                <li key={index} className="btn flex">
                                                    {" "}
                                                    <b className="bold">{index + 1}.</b> {finding}
                                                </li>
                                            )
                                        })
                                    )}
                                </ul>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className="conclusion">
                <h1>Conclusion</h1>
                {isLoading ? (
                    <>
                        {" "}
                        <ShimmerButton size="md" />
                    </>
                ) : (
                    <>{conclusion}</>
                )}
            </div>

            <div className="App">
                <header className="App-header">
                    <input type="file" accept="application/pdf" onChange={extractText} />
                </header>
            </div>
        </>
    )
}

export default AuditModel
