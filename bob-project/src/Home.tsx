import React, { useState } from "react"
import crocs from "./assets/crocod.png"
import { Button } from "./components/ui/button"
import { IoSparkles } from "react-icons/io5"
import AuditModel from "./components/AuditModel"
import AuditModelAzure from "./components/AuditModelAzure"
import AuditModelChart from "./components/AuditModelChart"
import CorbonDetector from "./components/CorbonDetector"
// import DialogDemo from "./components/ui/DialogDemo"
// const { GoogleGenerativeAI } = require("@google/generative-ai")

type Props = {}

function Home({}: Props) {
	const [Input, setInput] = useState("")
	function auto_grow(element) {
		// element.style.height = "5px"
		// element.style.height = element.scrollHeight + "px"
		setInput(element.value)
		console.log(Input)
	}
	return (
		<div className="mx-20 my-10">
			{/* <AuditModelAzure propsdata={Input} /> */}
			<AuditModelChart propsdata={Input} />
			{/* <CorbonDetector /> */}
		</div>
	)
}

export default Home
