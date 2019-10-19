import React from "react";
import RouterContext from "./RouterContext";
import {createBrowserHistory} from "history";
import query from "./query";
import {isFunc, isNull, isString} from "typeof-utility";
import {
	ACTION_TYPE_PAGE_LOAD,
	ACTION_TYPE_PAGE_REDIRECT,
	ANSWER_TYPE_ERROR, ANSWER_TYPE_PAGE,
	ANSWER_TYPE_REDIRECT,
	PAGE_ERROR,
	PAGE_INIT,
	QUERY_TYPE_PAGE
} from "./constants";
import {setMount, noop, runHook, createPathFromLocation, randId} from "./utils";
import PropTypes from 'prop-types';

const history = createBrowserHistory({});
const extendActions = {};

let historyInit = false;

function getLocation() {
	if( !historyInit ) {
		const initialPath = createPathFromLocation(history.location);
		history.replace(initialPath, {
			path: initialPath,
			title: document.title
		});
	}
	return history.location;
}

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

	let body, autoHeaders = true;

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
	} else {
		body = 'path=' + encodeURI(path)
	}

	const
		method = (options.method || "POST").toUpperCase(),
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

class Router extends React.Component {

	constructor(props) {
		super(props);
		const self = this, reload = props.reload === true;

		self.init = false;
		self.queryOpen = false;
		self.queryPart = false;
		self.location = getLocation();
		self.state = {};

		const hook = () => {
			return isFunc(self.props.hook) ? self.props.hook : noop;
		};

		const pushReplace = (method, path, store) => {
			const newStore = {...store, path};
			if (isNull(newStore.title)) {
				newStore.title = document.title
			}
			history[method](path, newStore)
		};

		const testPart = () => {
			if (self.queryPart) {
				const {path, options} = self.queryPart;
				self.queryPart = false;
				route(path, options)
			}
		};

		const render = state => {
			const closure = state => {
				self.queryOpen = false;
				self.setState(state);
				testPart();
			};

			runHook(hook(), closure, {
				type: ACTION_TYPE_PAGE_LOAD,
				id: state.id,
				page: state.page,
				data: state.data
			}, state)
		};

		const success = (payload, id) => {
			render({
				id,
				page: String(payload.page),
				data: payload.data
			})
		};

		const failure = (error, path, id) => {
			render({
				id,
				page: self.props.typePageError || PAGE_ERROR,
				data: {
					path,
					message: error.message
				}
			})
		};

		const redirect = location => {
			window.location = location
		};

		const route = (path, options = {}) => {

			const wait = () => {
				self.queryPart = {path, options}
			};

			if (self.queryOpen) {
				wait()
			} else {
				self.queryOpen = true;

				const
					{
						replace,
						historyState = {},
						...fetchOptions
					} = options,
					id = randId(),
					queryProps = (self.props.prepareQuery || prepareQuery)(path, fetchOptions, prepareQuery);

				query(
					queryProps,
					{
						id,
						hook: hook(),
						type: QUERY_TYPE_PAGE,
						success(json) {

							const {type, path: changePath = false, payload} = json;

							switch (type) {

								case ANSWER_TYPE_ERROR :
									failure(new Error(payload), path, id);
									break;

								case ANSWER_TYPE_REDIRECT :
									self.queryOpen = false;
									runHook(hook(), redirect, {type: ACTION_TYPE_PAGE_REDIRECT, to: payload}, payload);
									break;

								case ANSWER_TYPE_PAGE :
									if (isString(changePath) && changePath[0] === "/") {
										path = changePath
									}
									const
										method = replace || path === createPathFromLocation(self.location) ? "replace" : "push",
										store = (self.props.createHistoryState || createHistoryState)(path, payload, historyState, createHistoryState);

									pushReplace(method, path, store);
									success(payload, id);
									break;

								default :
									if(extendActions.hasOwnProperty(type)) {
										self.queryOpen = false;
										runHook(hook(), extendActions[type], {type, payload}, payload)
									}
									else {
										failure(new Error(`Unknown server answer type: ${type}`), path, id)
									}
									break;
							}
						},

						error(e) {
							failure(e, path, id)
						},

						abort() {
							self.queryOpen = false;
							wait()
						}
					}
				);
			}
		};

		self.unlisten = history.listen((location, action) => {

			const {state} = location;

			self.location = location;
			document.title = state.title;

			// from history
			if (action === "POP") {
				route(createPathFromLocation(location), {replace: true, historyState: state})
			}
		});

		self.route = route;
		self.push = (path, store = {}) => {
			pushReplace('push', path, store)
		};
		self.replace = (path, store = {}) => {
			pushReplace('replace', path, store)
		};
		self.getLocation = () => self.location;
		self.getHistory = () => history;

		// initial function

		if(reload) {
			self.reload = () => {
				self.init = true;
				self.reload = false;
				route(createPathFromLocation(self.location), {change: true})
			}
		}
		else {
			self.reload = () => {
				self.init = true;
				self.reload = false;
				render({
					id: randId(),
					page: props.page || props.typePageInit || PAGE_INIT,
					data: props.data || {}
				})
			}
		}
	}

	componentDidMount() {
		this.reload && this.reload()
	}

	componentWillUnmount() {
		this.unlisten && this.unlisten()
	}

	render() {

		// initial state
		const self = this;
		if(! self.init) {
			const {component: Component = false} = self.props;
			return (
				Component ? <Component /> : null
			)
		}

		const {props, state, getLocation: location, getHistory: history, route, push, replace} = self;
		setMount(null);

		return (
			<RouterContext.Provider
				children={props.children || null}
				value={{
					page: state.page,
					data: state.data,
					location, history, route, push, replace
				}}
			/>
		);
	}
}

Router.defaultProps = {
	reload: false
};

if (process.env.NODE_ENV !== "production") {

	Router.displayName = "Router";

	Router.propTypes = {

		/**
		 * Send request after page load
		 */
		reload: PropTypes.bool,

		/**
		 * Controller name
		 */
		page: PropTypes.string,

		/**
		 * Initial controller name (alias for `page` property)
		 */
		typePageInit: PropTypes.string,

		/**
		 * Error controller name
		 */
		typePageError: PropTypes.string,

		/**
		 * Data page
		 */
		data: PropTypes.object,

		/**
		 * Hook function to intercept events, abort events or modify data
		 */
		hook: PropTypes.func,

		/**
		 * Prepare query properties before fetch query
		 */
		prepareQuery: PropTypes.func,

		/**
		 * Create state history from page data
		 */
		createHistoryState: PropTypes.func,

		/**
		 * Initial root component
		 */
		componentInitial: PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.object])
	};
}

export function createRouterAction(action, callback) {
	if( !extendActions.hasOwnProperty(action) && isFunc(callback) ) {
		extendActions[action] = callback
	}
}

export default Router;