import {isFunc, isString} from "typeof-utility";
import {randId, runHook} from "./utils";
import {ACTION_TYPE_QUERY_CLOSE, ACTION_TYPE_QUERY_OPEN, QUERY_TYPE_UNKNOWN} from "./constants";

// polyfills
import 'whatwg-fetch';
import 'es6-promise/auto';

const locked = [];

function parseJson(response) {
	const {status, statusText} = response, validStatus = status >= 200 && status < 300;
	return new Promise((resolve, reject) => {
		response
			.json()
			.then(data => { resolve(data) })
			.catch(err => { reject(validStatus ? err : new Error(statusText)) })
	});
}

function unlock(lock) {
	const index = locked.indexOf(lock);
	if(index > -1) {
		locked.splice(index, 1)
	}
}

function complete(success, hook, id, type, callback, result) {
	const closure = (result, event) => {
		try {
			callback(result, event)
		}
		catch(e) {}
		unlock(type)
	};
	runHook(
		hook, closure, {
			type: ACTION_TYPE_QUERY_CLOSE,
			success,
			[success ? "response" : "error"]: result,
			queryType: type,
			id,
			unlock() {
				unlock(type)
			}
		}, result);
}

function newFetchObject(props) {
	if(isString(props)) {
		return fetch(props);
	}
	else {
		const {url, ...init} = props;
		return fetch(url, init);
	}
}

export default function query(props, options = {}) {
	const {type = QUERY_TYPE_UNKNOWN, id: queryId = false, abort} = options;
	if(locked.includes(type)) {
		isFunc(abort) && abort(type)
	}
	else {
		locked.push(type);
		const {hook, success, error} = options, id = queryId || randId();
		runHook(
			hook, () => {
				newFetchObject(props)
					.then(parseJson)
					.then(arg1 => { complete(true, hook, id, type, success, arg1) })
					.catch(arg1 => { complete(false, hook, id, type, error, arg1) });
			}, {
				type: ACTION_TYPE_QUERY_OPEN,
				queryType: type,
				id
			});
	}
}