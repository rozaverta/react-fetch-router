import React from "react";
import {Link} from "react-fetch-router";

export default function PageError(props) {
	const {
		title = "Error",
		code = 500,
		message = "Unknown error."
	} = props;
	return (
		<section>
			<h1>{code}. {title}</h1>
			<p>{message}</p>
			<p><Link to="/">Go home?</Link></p>
		</section>
	)
}