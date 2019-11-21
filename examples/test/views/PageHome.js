import React from "react";

export default function PageHome({title, text}) {
	return (
		<section>
			<h1>{title}</h1>
			<h2>Welcome! This is home page...</h2>
			<p>{text}</p>
		</section>
	)
}