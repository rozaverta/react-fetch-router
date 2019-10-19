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

function runHook(hook, closure, hooks, result) {

	let native = true, hookResult;

	if( isFunc(hook)) {

		hooks.closure = closure;
		hooks.preventDefault = () => { native = false };

		try {
			hookResult = hook(hooks);
			if(hookResult != null && typeOf(result) === typeOf(hookResult)) {
				result = hookResult
			}
		}
		catch(e) {
			native = true
		}
	}

	if( native ) {
		closure(result)
	}
}

function createPathFromLocation(location) {
	return location.pathname + location.search;
}

export {setMount, getMount, isMount, normalizeLink, randId, noop, runHook, createPathFromLocation, ErrorComponent}