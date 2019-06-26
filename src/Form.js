import React from "react";
import {isFunc} from "typeof-utility";
import PropTypes from "prop-types";
import RouterContext from "./RouterContext";
import {createPathFromLocation, normalizeLink} from "./utils";

class Form extends React.Component
{
	constructor(props, context) {
		super(props, context);
		const self = this;
		self.form = React.createRef();
		self.onSubmit = e => {
			e && isFunc(e.preventDefault) && e.preventDefault();
			const {props, context} = self;
			const options = (form, props) => {
				return {
					body: new FormData(form)
				}
			};
			props.disabled !== true &&
			context.route(
				normalizeLink(props.action == null ? createPathFromLocation(context.location()) : props.action),
				(props.prepareSubmitOptions || options)(self.form.current, props, options)
			);
		}
	}

	render() {
		const
			{props, form} = this,
			{component: Component = "form", prepareSubmitOptions, onSubmit, disabled, ...other} = props;

		other[isFunc(Component) ? "inputRef" : "ref"] = form;

		return (
			<Component onSubmit={this.onSubmit} {...other} />
		);
	}
}

Form.contextType = RouterContext;

if (process.env.NODE_ENV !== "production") {

	Form.displayName = "Form";

	Form.propTypes = {

		/**
		 * Form component (default "form")
		 */
		component: PropTypes.element,

		/**
		 * Preparation of data (query options) before sending
		 */
		prepareSubmitOptions: PropTypes.func,

		/**
		 * Disabled form
		 */
		disabled: PropTypes.bool,

		/**
		 * The relative URL of the page to submit the form data
		 */
		action: PropTypes.string

	};
}

export default Form;
