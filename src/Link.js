import React from "react";
import {isFunc} from "typeof-utility";
import RouterContext from "./RouterContext";
import PropTypes from "prop-types";
import {normalizeLink} from "./utils";

const Link = React.forwardRef(function Link(props, ref) {
	const {
		component: Component = "a",
		to,
		onClick,
		disabled,
		replace,
		...other
	} = props;

	const
		route = React.useContext(RouterContext).route,
		clickHandler = (e) => {
			e && isFunc(e.preventDefault) && e.preventDefault();
			if (disabled !== true) {
				route(normalizeLink(to), {replace: replace === true});
				isFunc(onClick) && onClick(e)
			}
		};

	if (Component === "a" && !other.href) {
		other.href = normalizeLink(to);
	}

	if (disabled && (Component === "button" || isFunc(Component))) {
		other.disabled = true;
	}

	return (
		<Component ref={ref} onClick={clickHandler} {...other} />
	);
});

if (process.env.NODE_ENV !== "production") {

	Link.displayName = "Link";

	Link.propTypes = {

		/**
		 * Link component (default "a")
		 */
		component: PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.object]),

		/**
		 * Relative URL
		 */
		to: PropTypes.string.isRequired,

		/**
		 * Disabled link
		 */
		disabled: PropTypes.bool,

		/**
		 * Use history replacement method (do not save in history)
		 */
		replace: PropTypes.bool,
	};
}

export default Link;
