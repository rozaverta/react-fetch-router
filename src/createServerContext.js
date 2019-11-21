import {noop} from "./utils";
import {isFunc} from "typeof-utility";

export default function createServerContext(options = {}) {
	const {
		hook = noop,
		url = "/",
	} = options;

	return {
		hook: isFunc(hook) ? hook : noop,
		history: {},
		getLocation: () => url,
		redirect: noop,
		createHistoryState: noop,
		prepareQuery: noop,
		formOptions: noop,
	};
}