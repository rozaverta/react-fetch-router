import React from "react";
import Route from "./Route";
import {isMount, setMount, ErrorComponent} from "./utils";
import PropTypes from "prop-types";

class RouteDefault extends Route {
	render() {
		const {props, context} = this,
		{
			page,
			data,
		} = context,
		{
			component: Component = ErrorComponent,
			componentProps = {}
		} = props;

		if(isMount()) {
			return null
		}
		else {
			setMount(page);
			return (
				<Component page={page} {...componentProps} {...data} />
			)
		}
	}
}

RouteDefault.defaultProps = {};

if (process.env.NODE_ENV !== "production") {

	RouteDefault.displayName = "RouteDefault";

	RouteDefault.propTypes = {

		/**
		 * Controller component.
		 */
		component: PropTypes.element.isRequired,

		/**
		 * Controller component props.
		 */
		componentProps: PropTypes.object
	};
}

export default RouteDefault;