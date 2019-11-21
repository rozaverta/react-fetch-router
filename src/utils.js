import React from "react";
import {isFunc, typeOf} from "typeof-utility";

let mountPage = null;

function ErrorComponent() {
	return (
		<div>Error, &lt;Route /&gt; component property is empty</div>
	)
}

function setMount(name) {
	mountPage = name
}

function getMount() {
	return mountPage
}

function isMount() {
	return mountPage !== null
}

function normalizeLink(link = "/") {
	link = String(link);
	if( ! link.length || link[0] !== "/" ) {
		link = "/" + link
	}
	return link;
}

function randId()
{
	return "queryId" + Math.random().toString(36).substr(2)
}

function noop() {}

function runHook(hook, closure, event, result) {

	let native = true, close = false, hookResult;

	if( isFunc(hook) ) {
		event.preventDefault = () => { native = false };
		event.closed = () => close;
		event.closure = (result) => {
			close = true;
			return closure(result, event);
		};

		try {
			hookResult = hook(event);
			if(hookResult != null && typeOf(result) === typeOf(hookResult)) {
				result = hookResult
			}
		}
		catch(e) {
			native = true
		}
	}

	if( native && ! close ) {
		close = true;
		closure(result, event);
	}
}

function createPathFromLocation(location) {
	return location.pathname + location.search;
}

function isDomElement() {
	return !! (typeof window !== 'undefined' && window.document && window.document.createElement);
}

function setRef(ref, value) {
	if (typeof ref === 'function') {
		ref(value);
	} else if (ref) {
		ref.current = value;
	}
}

function useForkRef(refA, refB) {
	/**
	 * This will create a new function if the ref props change and are defined.
	 * This means react will call the old forkRef with `null` and the new forkRef
	 * with the ref. Cleanup naturally emerges from this behavior
	 */
	return React.useMemo(() => {
		if (refA == null && refB == null) {
			return null;
		}
		return refValue => {
			setRef(refA, refValue);
			setRef(refB, refValue);
		};
	}, [refA, refB]);
}

export {setMount, getMount, isMount, normalizeLink, randId, noop, runHook, isDomElement, createPathFromLocation, ErrorComponent, useForkRef}