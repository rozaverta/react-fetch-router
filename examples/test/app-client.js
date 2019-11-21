import React from "react";
import ReactDOM from "react-dom";
import App from "./views/App";
import "react-fetch-router/polyfills"; // add polyfills for client
import {createClientContext} from "react-fetch-router";

const
	{page, data} = __$page,
	context = createClientContext();

ReactDOM.hydrate(<App page={page} data={data} context={context} />, document.getElementById("app"));