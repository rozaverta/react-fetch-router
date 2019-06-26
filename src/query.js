import {isFunc, isString} from "typeof-utility";
import {rand, runHook} from "./utils";
import {ACTION_TYPE_QUERY_CLOSE, ACTION_TYPE_QUERY_OPEN, QUERY_TYPE_UNKNOWN} from "./constants";

const locked = [];

function status(response) {
	if (response.status >= 200 && response.status < 300) {
		return Promise.resolve(response)
	} else {
		return Promise.reject(new Error(response.statusText))
	}
}

function json(response) {
	return response.json()
}

function unlock(lock) {
	const index = locked.indexOf(lock);
	if(index > -1) {
		locked.splice(index, 1)
	}
}

function complete(success, hook, id, type, callback, result) {

	const closure = result => {
		try {
			callback(result)
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
			id
		}, result);
}

export default function query(props, options = {}) {

	const {type = QUERY_TYPE_UNKNOWN, abort} = options.type;

	if(locked.indexOf(type) > -1) {
		isFunc(abort) && abort(type)
	}
	else {
		locked.push(type);
		const {hook, success, error} = options, id = rand("queryId_");
		let _fetch;

		if(isString(props)) {
			_fetch = () => fetch(props);
		}
		else {
			const {input, ...init} = props;
			_fetch = () => fetch(input, init);
		}

		runHook(
			hook, () => {
				_fetch()
					.then(status)
					.then(json)
					.then(arg1 => { complete(true, hook, id, type, success, arg1) })
					.catch(arg1 => { complete(false, hook, id, type, error, arg1) });
			}, {
				type: ACTION_TYPE_QUERY_OPEN,
				queryType: type,
				id
			});
	}
}