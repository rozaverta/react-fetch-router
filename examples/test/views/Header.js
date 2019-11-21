import React from "react";
import {Link} from "react-fetch-router";

export default function Header({menu = []}) {
	return (
		<header>
			<h3>My website</h3>
			<ul>{menu.map((item, index) => (
				<li key={index}>
					<Link to={item.link}>
						{(item.active ? '[' : '') + item.label + (item.active ? ']' : '')}
					</Link>
				</li>
			))}</ul>
		</header>
	)
}