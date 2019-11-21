import React from "react";
import ReactDOMServer from 'react-dom/server';
import path from 'path'
import express from 'express'
import fs from "fs";
import {constants, createServerContext} from "react-fetch-router";
import App from "./views/App";

const DIST_DIR = path.join(__dirname, '../');
const app = express();
const menu = getConfigJson('menu');
const redirectOld = getConfigJson('redirect-old');

function getConfigJson(name) {
	return JSON.parse(fs.readFileSync(path.join(DIST_DIR, `config/${name}.json`) ));
}

function render(payload, url) {
	const
		{page, data} = payload,
		context = createServerContext({ url: url || "/" }),
		htmlApp = ReactDOMServer.renderToString(<App page={page} data={data} context={context} />),
		pageApp = JSON.stringify(payload);

	return `<!doctype html>
<html lang="en">
<head>
<title>${data.title}</title>
</head>
<body>
<div id="app">${htmlApp}</div>
<script>window.__$page=${pageApp};</script>
<script src="/app.js"></script>
</body>
</html>`;
}

function testPage(name, req, res, next, api = false) {

	if(redirectOld[name]) {
		if(api) {
			return res.json({
				type: constants.ANSWER_TYPE_REDIRECT,
				payload: "/" + redirectOld[name],
			});
		}
		else {
			return res.redirect("/" + redirectOld[name]);
		}
	}

	const file = /^[a-z0-9\-]+$/.test(name) ? path.join(DIST_DIR, 'pages', `${name}.json`) : false;

	if(file && fs.existsSync(file)) {
		fs.readFile(file, (err, payload) => {
			if (err) {
				return next(err);
			}

			try {
				payload = JSON.parse(payload);
			}
			catch(err) {
				if(api) {
					return res.json({
						type: constants.ANSWER_TYPE_ERROR,
						payload: {
							code: 500,
							message: err.message,
						},
					});
				}
				else {
					return next(err);
				}
			}

			if(!payload.page) {
				payload.page = "PAGE";
			}

			if(!payload.data) {
				payload.data = {};
			}

			payload.path = req.url;
			payload.data.pageName = name;
			payload.data.menu = menu.map(item => {
				return {
					label: item.label,
					link: item.link,
					active: item.name === name,
				}
			});

			if(api) {
				res.json({
					type: constants.ANSWER_TYPE_PAGE,
					payload
				});
			}
			else {
				res.end(render(payload, req.url));
			}
		});
	}
	else if(api) {
		return res.json({
			type: constants.ANSWER_TYPE_ERROR,
			payload: {
				code: 404,
				message: "Page not found.",
			},
		});
	}
	else {
		const err = new Error("Page not found.");
		err.code = 404;
		next(err);
	}
}

app.use(express.static(path.join(DIST_DIR, 'public')));

app.use("/api", (req, res, next) => {
	let page = req.query['path'] || "/";
	if(page === "/") {
		page = "home"
	}
	else if(page[0] === "/") {
		page = page.substr(1);
		if(page === "home") {
			page = ""
		}
	}
	testPage(page, req, res, next, true)
});

app.get("/", (req, res, next) => {
	testPage("home", req, res, next)
});

app.get("/:name", (req, res, next) => {
	const name = req.params['name'];
	testPage(name === "home" ? null : name, req, res, next)
});

app.use("*", (req, res, next) => {
	const error = new Error("Page not found.");
	error.code = 404;
	return next(error);
});

const statuses = [
	100,101,102,103,
	200,201,202,203,204,205,206,
	300,301,302,303,304,305,306,307,308,
	400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,
	500,501,502,503,504,505,
];

app.use((err, req, res, next) => {
	const code = err.code || 500;
	res.status(statuses.includes(code) ? code : 500);
	res.end(render({
		page: constants.PAGE_ERROR,
		data: {
			code,
			path: req.url,
			title: err.message,
			message: err.message,
		},
	}, req.url));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
	console.log(`App listening to ${PORT}....`);
	console.log('Press Ctrl+C to quit.');
});