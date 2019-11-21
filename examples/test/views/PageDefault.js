import React from "react";

export default function PageDefault({title, text}) {
	return (
		<section>
			<h1>{title}</h1>
			<div>{text}</div>
		</section>
	)
}