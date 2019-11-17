import React from "react";
import RouterContext from "./RouterContext";
import {setMount, noop} from "./utils";
import PropTypes from 'prop-types';

const ServerRouter = function ServerRouter({children = null, page, data}) {
	setMount(null);
	const value = {page, data};
	["location", "history", "route", "push", "replace"].forEach(key => { value[key] = noop });
	return (
		<RouterContext.Provider children={children} value={value} />
	);
};

if (process.env.NODE_ENV !== "production") {

	ServerRouter.displayName = "ServerRouter";

	ServerRouter.propTypes = {

		/**
		 * Controller name
		 */
		page: PropTypes.string,

		/**
		 * Data page
		 */
		data: PropTypes.object,
	};
}

export default ServerRouter;