import {
	ACTION_TYPE_PAGE_LOAD,
	ACTION_TYPE_QUERY_OPEN,
	ACTION_TYPE_QUERY_CLOSE,
	ACTION_TYPE_PAGE_REDIRECT,
	ACTION_TYPE_INITIALIZE
} from "./constants";
import {isFunc} from "typeof-utility";

export default function createReduxReducer(store, pageContext, redirectHook) {

	if (process.env.NODE_ENV !== "production") {
		['dispatch', 'subscribe', 'getState'].forEach(key => {
			if( ! isFunc(store[key] ) ) {
				throw new Error(`Invalid store object, the ${key} function not found`)
			}
		})
	}

	if( pageContext == null || pageContext === "" ) {
		pageContext = "*"
	}

	const pageIsLocalContext = pageContext !== "*";
	const isRedirectHook = typeof redirectHook === "function";

	let queryId = false;
	let closure = () => {
		if (process.env.NODE_ENV !== "production") {
			throw new Error("Not own sending, closure function was not registered")
		}
	};

	const reducer = (state, action) => {
		if(action.type === ACTION_TYPE_PAGE_LOAD) {
			if(pageIsLocalContext) {
				return {...action.payload}
			}
			else {
				return {...state, ...action.payload}
			}
		}
		else {
			return state
		}
	};

	reducer.hook = e => {
		const {type} = e;

		switch(type) {

			case ACTION_TYPE_PAGE_LOAD:
			case ACTION_TYPE_INITIALIZE:
				closure = e.closure;
				e.preventDefault();
				store.dispatch({
					type,
					payload: {
						id: e.id,
						page: e.page,
						data: e.data
					}
				});
				break;

			case ACTION_TYPE_QUERY_OPEN:
				store.dispatch({
					type,
					payload: {
						id: e.id,
						queryType: e.queryType
					}
				});
				break;

			case ACTION_TYPE_QUERY_CLOSE:
				const queryName = e.success ? "response" : "error";
				store.dispatch({
					type,
					payload: {
						id: e.id,
						queryType: e.queryType,
						success: e.success,
						[queryName]: e[queryName]
					}
				});
				break;

			case ACTION_TYPE_PAGE_REDIRECT:
				if(isRedirectHook) {
					return redirectHook(e)
				}
				break;
		}
	};

	reducer.reducerActionTypes = [ACTION_TYPE_PAGE_LOAD];
	if(pageIsLocalContext) {
		reducer.reducerContext = pageContext;
	}

	reducer.unsubscribe = store.subscribe(() => {
		let state = store.getState();

		if(pageIsLocalContext) {
			state = state[pageContext];
		}

		if(state.id && state.id !== queryId) {
			queryId = state.id;

			const once = closure;

			if (process.env.NODE_ENV !== "production") {
				closure = reload => {
					once(reload);
					setTimeout(() => {
						throw new Error("Warning: Integrity of immutable data is broken.")
					})
				};
			}

			once({
				id: state.id,
				page: state.page,
				data: {}
			})
		}
	});

	return reducer;
}