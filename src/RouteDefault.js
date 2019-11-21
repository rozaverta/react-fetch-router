import React from "react";
import {isMount, setMount, ErrorComponent} from "./utils";
import PropTypes from "prop-types";
import RouterContext from "./RouterContext";

const RouteDefault = React.forwardRef(function RouteDefault(props, ref) {
	const
		context = React.useContext(RouterContext), {
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

	setMount(page);
	return (
		<Component ref={ref} {...componentProps} page={page} {...data} />
	)
});

RouteDefault.defaultProps = {};

if (process.env.NODE_ENV !== "production") {
	RouteDefault.displayName = "RouteDefault";
	RouteDefault.propTypes = {

		/**
		 * Controller component.
		 */
		component: PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.object]).isRequired,

		/**
		 * Controller component props.
		 */
		componentProps: PropTypes.object
	};
}

export default RouteDefault;