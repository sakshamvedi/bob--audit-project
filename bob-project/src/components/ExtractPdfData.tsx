import React from "react"
import Resume from "../assets/resume.pdf"
type Props = {}
import { PDFExtract, PDFExtractOptions } from "pdf.js-extract"
function ExtractPdfData({}: Props) {
	const pdfExtract = new PDFExtract()
	const options: PDFExtractOptions = {} /* see below */
	pdfExtract
		.extract(Resume, options)
		.then((data) => console.log(data))
		.catch((err) => console.log(err))
	return <div>ExtractPdfData</div>
}

export default ExtractPdfData
