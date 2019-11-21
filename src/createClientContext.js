import {isFunc, isString} from "typeof-utility";
import {createBrowserHistory} from "history";
import {createPathFromLocation, noop, normalizeLink} from "./utils";

function createHistoryState(path, payload, optionsStore) {
	const store = {
		...optionsStore, path
	};

	if (!store.hasOwnProperty("title")) {
		store.title = payload.data && payload.data.title || document.title
	}

	return store
}

function prepareQuery(path, options) {
	let body,
		autoHeaders = true;

	if (options.body) {
		body = options.body;
		if (isString(body)) {
			body += '&path=' + encodeURI(path)
		} else {
			autoHeaders = false;
			if ((body instanceof FormData) && !body.has("path")) {
				body.append("path", path)
			}
		}
	}
	else {
		body = 'path=' + encodeURI(path)
	}

	const
		method = (options.method || "GET").toUpperCase(),
		queryPath = {
			url: options.url || "/api",
			method,
			headers: options.headers || (autoHeaders && method === "POST" ? {"Content-type": "application/x-www-form-urlencoded; charset=UTF-8"} : {}),
			body
		};

	["mode", "cache", "credentials", "redirect", "referrer"].forEach(key => {
		const value = options[key] || null;
		if (value && isString(value)) {
			queryPath[key] = value
		}
	});

	return queryPath;
}

function formOptions(form) {
	return {
		body: new FormData(form),
		method: "POST",
	}
}

export default function createClientContext(options = {}) {

	const history = createBrowserHistory({});
	let historyInit = false;

	const {
		hook = noop,
		createHistoryState: createHistoryStateOption,
		prepareQuery: prepareQueryOption,
		formOptions: formOptionsOption,
	} = options;

	return {
		hook: isFunc(hook) ? hook : noop,
		history,
		getLocation() {
			if( !historyInit ) {
				const initialPath = createPathFromLocation(history.location);
				history.replace(initialPath, {
					path: initialPath,
					title: document.title
				});
			}
			return history.location;
		},
		redirect: location => {
			window.location = location;
		},
		createHistoryState: isFunc(createHistoryStateOption)
			? (path, payload, historyState) => createHistoryStateOption(path, payload, historyState, createHistoryState)
			: createHistoryState,
		prepareQuery: isFunc(prepareQueryOption)
			? (path, fetchOptions) => prepareQueryOption(path, fetchOptions, prepareQuery)
			: prepareQuery,
		formOptions: isFunc(formOptionsOption)
			? (form, props) => formOptionsOption(form, props, formOptions)
			: formOptions,
	};
}