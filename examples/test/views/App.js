import React from "react";
import {Router, Route, constants} from "react-fetch-router";
import Footer from "./Footer";
import Header from "./Header";
import PageHome from "./PageHome";
import PageError from "./PageError";
import PageDefault from "./PageDefault";

export default function App({page, data, context}) {
	return (
		<Router page={page} data={data} context={context}>

			{/* use chunk attribute for duplicate or independent code */}
			<Route from={["PAGE", "PAGE_HOME"]} chunk={true} component={Header} />

			<Route from="PAGE_HOME" component={PageHome} />
			<Route from="PAGE" component={PageDefault} />
			<Route from={constants.PAGE_ERROR} component={PageError} />

			{/* footer render for all pages */}
			<Footer />
		</Router>
	)
}