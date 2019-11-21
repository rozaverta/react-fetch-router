import React from "react";
import {isFunc} from "typeof-utility";
import PropTypes from "prop-types";
import RouterContext from "./RouterContext";
import {createPathFromLocation, normalizeLink, useForkRef} from "./utils";

const Form = React.forwardRef(function Form(props, ref) {

	const {formOptions, location, route} = React.useContext(RouterContext);
	const formRef = React.useRef(null);
	const forkRef = useForkRef(formRef, ref);
	const {
		component: Component = "form",
		onSubmit,
		disabled,
		...other
	} = props;

	const submitHandle = e => {
		e && isFunc(e.preventDefault) && e.preventDefault();
		disabled !== true &&
		route(
			normalizeLink(props.action == null ? createPathFromLocation(location) : props.action),
			formOptions(formRef.current, props)
		);
	};

	return (
		<Component ref={forkRef} onSubmit={submitHandle} {...other} />
	);
});

if (process.env.NODE_ENV !== "production") {

	Form.displayName = "Form";

	Form.propTypes = {

		/**
		 * Form component (default "form")
		 */
		component: PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.object]),

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
