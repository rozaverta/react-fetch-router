import {noop} from "./utils";
import {isFunc} from "typeof-utility";

export default function createServerContext(options = {}) {
	const {
		hook = noop,
		url = "/",
	} = options, noopNoop = () => noop;

	return {
		hook: isFunc(hook) ? hook : noop,
		history: {
			listen: noopNoop,
			block: noopNoop,
			length: 0,
			action: 'POP',
			location: {},
			createHref: noop,
			push: noop,
			replace: noop,
			go: noop,
			goBack: noop,
			goForward: noop,
		},
		getLocation: () => url,
		redirect: noop,
		createHistoryState: noop,
		prepareQuery: noop,
		formOptions: noop,
	};
}