import React from "react";
import RouterContext from "./RouterContext";
import {isFunc, isString} from "typeof-utility";
import {isMount, setMount, ErrorComponent} from "./utils";
import PropTypes from "prop-types";

function matchType(from, page) {

	if(isString(from)) {
		return from === page
	}

	if(isFunc(from)) {
		return from(page)
	}

	if(from instanceof RegExp) {
		return from.test(page)
	}

	if(Array.isArray(from)) {
		for(let i = 0, length = from.length; i < length; i++) {
			if(matchType(from[i], page)) {
				return true
			}
		}
	}

	return false
}

const Route = React.forwardRef(function Route(props, ref) {
	const
		context = React.useContext(RouterContext), {
			page,
			data,
		} = context, {
			from,
			chunk,
			component: Component = ErrorComponent,
			componentProps = {}
		} = props;

	if(!chunk && isMount()) {
		return null
	}

	if(matchType(from, page)) {
		if(!chunk) {
			setMount(page)
		}
		return (
			<Component ref={ref} {...componentProps} page={page} {...data} />
		)
	}

	return null
});

Route.defaultProps = {
	chunk: false
};

if (process.env.NODE_ENV !== "production") {
	Route.displayName = "Route";
	Route.propTypes = {

		/**
		 * Controller component.
		 */
		component: PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.object]).isRequired,

		/**
		 * Page controller name.
		 */
		from: PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.func,
			PropTypes.array,
			PropTypes.instanceOf(RegExp)
		]).isRequired,

		/**
		 * Use <Route /> node as chunk for duplicate or independent code.
		 */
		chunk: PropTypes.bool,

		/**
		 * Additional or default controller component props.
		 */
		componentProps: PropTypes.object
	};
}

export default Route;