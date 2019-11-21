import React from "react";
import query from "./query";
import {isFunc, isNull, isPlainObject, isString} from "typeof-utility";
import {
	ACTION_TYPE_PAGE_LOAD,
	ACTION_TYPE_PAGE_REDIRECT,
	ANSWER_TYPE_ERROR, ANSWER_TYPE_PAGE,
	ANSWER_TYPE_REDIRECT,
	PAGE_ERROR,
	PAGE_INIT,
	QUERY_TYPE_PAGE
} from "./constants";
import {runHook, createPathFromLocation, randId, isDomElement} from "./utils";
import PropTypes from 'prop-types';
import createClientContext from "./createClientContext";
import createServerContext from "./createServerContext";
import RouterInsider from "./RouterInsider";

const extendActions = {};
function createRouterAction(action, callback) {
	if( !extendActions.hasOwnProperty(action) && isFunc(callback) ) {
		extendActions[action] = callback
	}
}

class Router extends React.Component {

	constructor(props) {
		super(props);

		const
			self = this,
			context = props.context || (isDomElement() ? createClientContext() : createServerContext()),
			{hook, history, getLocation, createHistoryState, prepareQuery, redirect} = context;

		let queryOpen = false,
			queryPart = false,
			location  = getLocation();

		self.insider = React.createRef();

		function pushReplace(method, path, store) {
			const newStore = {...store, path};
			if (isNull(newStore.title)) {
				newStore.title = document.title
			}
			history[method](path, newStore)
		}

		function testPart() {
			if(queryPart) {
				const {path, options} = queryPart;
				queryPart = false;
				route(path, options)
			}
		}

		function render(state) {
			const closure = state => {
				queryOpen = false;
				self.insider.current.setState(state);
				testPart();
			};
			runHook(hook, closure, {
				type: ACTION_TYPE_PAGE_LOAD,
				id: state.id,
				page: state.page,
				data: state.data
			}, state);
		}

		function success(payload, id) {
			render({
				id,
				page: String(payload.page),
				data: payload.data
			});
		}

		function failure(error, path, id) {
			render({
				id,
				page: PAGE_ERROR,
				data: {
					code: error.code || 500,
					path,
					title: error.message,
					message: error.message,
				}
			});
		}

		function createError(payload) {
			if( !isPlainObject(payload) ) {
				payload = {
					message: payload
				}
			}
			const error = new Error( payload.message || "Unknown error." );
			if(payload.code) {
				error.code = payload.code;
			}
			return error;
		}

		function route(path, options = {}) {

			const wait = () => {
				queryPart = {path, options}
			};

			if (queryOpen) {
				wait()
			}
			else {
				queryOpen = true;

				const {
						replace,
						historyState = {},
						...fetchOptions
					} = options,
					id = randId(),
					queryProps = prepareQuery(path, fetchOptions);

				query(
					queryProps,
					{
						id,
						hook,
						type: QUERY_TYPE_PAGE,
						success(json, event) {

							const {type, path: changePath = false, payload} = json;

							switch (type) {

								case ANSWER_TYPE_ERROR :
									failure(createError(payload), path, id);
									break;

								case ANSWER_TYPE_REDIRECT :
									queryOpen = false;
									runHook(hook, redirect, {type: ACTION_TYPE_PAGE_REDIRECT, to: payload}, payload);
									break;

								case ANSWER_TYPE_PAGE :
									if (isString(changePath) && changePath[0] === "/") {
										path = changePath;
									}
									const
										method = replace || path === createPathFromLocation(location) ? "replace" : "push",
										store = createHistoryState(path, payload, historyState);

									pushReplace(method, path, store);
									success(payload, id);
									break;

								default :
									if(extendActions.hasOwnProperty(type)) {
										queryOpen = false;
										runHook(hook, extendActions[type], {type, payload, unlock: event.unlock}, payload);
									}
									else {
										failure(new Error(`Unknown server answer type: ${type}`), path, id);
									}
									break;
							}
						},

						error(e) {
							failure(e, path, id);
						},

						abort() {
							queryOpen = false;
							wait();
						}
					}
				);
			}
		}

		self.componentWillUnmount = history.listen((loc, action) => {
			const {state} = loc;
			location = loc;
			document.title = state.title;
			// from history
			if (action === "POP") {
				route(createPathFromLocation(loc), {replace: true, historyState: state})
			}
		});

		self.contextOptions = {
			... context,
			getContextLocation() { return location },
			route,
			push(path, store = {}) { pushReplace('push', path, store); },
			replace(path, store = {}) { pushReplace('replace', path, store); },
		};
	}

	shouldComponentUpdate(nextProps, nextState, nextContext) {
		return false;
	}

	render() {
		const {props, contextOptions, insider} = this;
		return (
			<RouterInsider
				ref={insider}
				reload={props.reload === true}
				componentInitial={props.componentInitial || undefined}
				contextOptions={contextOptions}
				id={randId()}
				page={props.page || PAGE_INIT}
				data={props.data || {}}
				children={props.children}
			/>
		);
	}
}

Router.defaultProps = {
	reload: false,
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
		 * Data page
		 */
		data: PropTypes.object,

		/**
		 * Initial root component
		 */
		componentInitial: PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.object])
	};
}

export {createRouterAction};
export default Router;