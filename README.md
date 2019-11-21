# react-fetch-router

> Routing library for React. Works with JSON AJAX responses (native fetch object). 
> The router uses page types (derived from the response), rather than URL paths.

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm i --save react-fetch-router
```

## Library components and functions

| **Component** | **Description** |
| --- | --- |
| `<Router/>` | The common low-level interface for all router components. |
| `<Route/>` | Basic component for render some UI when a request page type matches the route page type path. |
| `<RouteDefault/>` | The default component for render some UI when the type of the request page does not correspond to any of the above components of the `<Route/>`. |
| `<Link/>` | Provides declarative, accessible navigation around your application. |
| `<Form/>` | Submitting form data to your application.  |
| `RouterContext` | Global context. See the React Context documentation. |
| `constants` | Library constants for types and queries. |
| `query` | A wrapper for the native `fetch` object. |
| `createReduxReducer` | Integration with the `redux` library. Creates a new reducer. As arguments, the function accepts current store object, context, and hook function for redirection. |
| `createRouterAction` | Create custom router action. |
| `createClientContext(options = {})` | Creates a value for the client side of RouterContext object. |
| `createServerContext(options = {})` | Creates a value for the server side of RouterContext object. |

___

Documentation and full description will appear later. Coming soon... Maybe :)