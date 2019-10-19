# react-fetch-router

> Routing library for React. Works with JSON AJAX responses (native fetch object). 
> The router uses page types (derived from the response), rather than URL paths.

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm i --save react-fetch-router
```

## Usage example

**`app.js`** - frontend

```jsx harmony
import React from "react";
import ReactDOM from "react-dom";
import {Router, Route, Link, constants} from "react-fetch-router";

// This is your libraries

import ComponentPage from "./your-project/ComponentPage";
import ComponentPage404 from "./your-project/ComponentPage404";
import ComponentHomePage from "./your-project/ComponentHomePage";
import Header from "./your-project/Header";
import Footer from "./your-project/Footer";

// Default welcome page. Render after page load

class WelcomePage extends React.Component {
	render() {
		const {title, text} = this.props;
		return (
			<div className="welcome-page">
				<h1>{title}</h1>
				<ul>
					<li><Link to="/page1">First page</Link></li>
					<li><Link to="/page2">Second page</Link></li>
					<li><Link to="/">Home page</Link></li>
					<li><Link to="/page3">Page not found</Link></li>
				</ul>		
				<div className="content">{text}</div>		
			</div>
		)
	}
}

// Root app component

class App extends React.Component {
	render() {
		const {page, data} = this.props;
		return (
			<Router page={page} data={data}>
				/* use chunk attribute for duplicate or independent code */
				<Route from={["PAGE", "PAGE_HOME"]} chunk={true} component={Header} />
				
				<Route from={constants.PAGE_INIT} component={WelcomePage} />
				<Route from="PAGE" component={ComponentPage} />
				<Route from="PAGE_HOME" component={ComponentHomePage} />
				<Route from="PAGE_404" component={ComponentPage404} />
				
				/* footer render for all pages*/
				<Footer />
			</Router>
		)
	}
}

// Default data

const homePageData = {
	
	// It is recommended to use the `title` parameter. it is used as document.title
	title: "Welcome",
	
	// Other arguments depend on the page controller and can be any
	text: "Hello, world!"
};

// Render component

ReactDOM.render(<App data={homePageData} />, document.getElementById("app"));
```

**`api.php`** - backend (redirected from `/api?path={urlPath}` query, method POST)

```php
<?php

$path = explode("?", ($_POST["path"] ?? "/"), 2)[0];
switch($path) {
	
	case "/page1":
		$page = "PAGE";
		$data = [
			"title" => "Page 1",
			"text" => "This is default page. Number 1"
		];
		break;
		
	case "/page2":
		$page = "PAGE";
		$data = [
			"title" => "Page 1",
			"text" => "This is default page. Number 2"
		];
		break;
		
	case "/":
	case "":
		$page = "PAGE_HOME";
		$data = [
			"title" => "Hello!",
			"text" => "This is home page. Wow!"
		];
		break;
		
	default:
		$page = "PAGE_404";
		$data = [
			"title" => "404",
			"text" => "Page not found."
		];
		break;
}

header("Content-Type: application/json; charset=utf-8");

echo json_encode([
	"type" => "PAGE",
	"payload" => [
		"page" => $page,
		"data" => $data
	]
]);
```

## Library components and functions

| **Component** | **Description** |
| --- | --- |
| `<Router/>` | The common low-level interface for all router components. |
| `<Route/>` | Basic component for render some UI when a request page type matches the route page type path. |
| `<RouteDefault/>` | The default component for render some UI when the type of the request page does not correspond to any of the above components of the `<Route/>`. |
| `<Link/>` | Provides declarative, accessible navigation around your application. |
| `<Form/>` | Submitting form data to your application.  |
| `RouterContext` | Global context. See the React Context documentation. |
| `constants` | Library constants for types and queries. |
| `query` | A wrapper for the native `fetch` object. |
| `createReduxReducer` | Integration with the `redux` library. Creates a new reducer. As arguments, the function accepts current store object, context, and hook function for redirection. |
| `createRouterAction` | Create custom router action. |

___

Documentation and full description will appear later. Coming soon... Maybe :)