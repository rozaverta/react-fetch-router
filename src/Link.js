import React from "react";
import {isFunc} from "typeof-utility";
import RouterContext from "./RouterContext";
import PropTypes from "prop-types";
import {normalizeLink} from "./utils";

class Link extends React.Component
{
	constructor(props, context) {
		super(props, context);
		const self = this;
		self.onClick = e => {
			e && isFunc(e.preventDefault) && e.preventDefault();
			const {props, context} = self;
			props.disabled !== true &&
			context.route(
				normalizeLink(props.to), {replace: props.replace === true}
			);
		}
	}

	render() {
		const
			self = this,
			{props} = self,
			{component: Component = "a", to, onClick, disabled, replace, ...other} = props;

		if(Component === "a" && ! other.href) {
			other.href = normalizeLink(to);
		}

		if(disabled && (Component === "button" || isFunc(Component))) {
			other.disabled = true;
		}

		return (
			<Component onClick={self.onClick} {...other} />
		);
	}
}

Link.contextType = RouterContext;

if (process.env.NODE_ENV !== "production") {

	Link.displayName = "Link";

	Link.propTypes = {

		/**
		 * Link component (default "a")
		 */
		component: PropTypes.element,

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
		replace: PropTypes.bool

	};
}

export default Link;
