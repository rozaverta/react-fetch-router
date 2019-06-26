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

class Route extends React.Component {
	render() {
		const {props, context} = this,
		{
			page,
			data,
		} = context,
		{
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
				<Component page={page} {...componentProps} {...data} />
			)
		}

		return null
	}
}

Route.contextType = RouterContext;
Route.defaultProps = {
	chunk: false
};

if (process.env.NODE_ENV !== "production") {

	Route.displayName = "Route";

	Route.propTypes = {

		/**
		 * Controller component.
		 */
		component: PropTypes.element.isRequired,

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