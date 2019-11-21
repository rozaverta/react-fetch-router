import {createPathFromLocation, runHook, setMount} from "./utils";
import {ACTION_TYPE_INITIALIZE} from "./constants";
import RouterContext from "./RouterContext";

class RouterInsider extends React.Component {
	constructor(props) {
		super(props);
		const
			self = this,
			{hook, route, getContextLocation} = props.contextOptions;

		self.state = {
			id: props.id,
			page: props.page,
			data: props.data,
		};

		if(props.reload) {
			self.reload = () => {
				self.reload = false;
				route(createPathFromLocation(getContextLocation()), {change: true})
			}
		}
		else {
			const {state} = self;
			runHook(hook, ({id, page, data}) => {
				if((id !== state.id || page !== state.page || data !== state.data)) {
					const newState = {
						id, page, data
					};
					if(self.mounted) {
						self.setState(newState);
					}
					else {
						self.state = newState;
					}
				}
			}, {
				type: ACTION_TYPE_INITIALIZE,
				... state,
			}, state)
		}
	}

	componentDidMount() {
		this.mounted = true;
		this.reload && this.reload();
	}

	render() {
		const {reload, props, state} = this;
		if(reload) {
			const {componentInitial: Component = false} = props;
			return (
				Component ? <Component /> : null
			)
		}
		else {
			setMount(null);
			return (
				<RouterContext.Provider children={props.children}
					value={{
						... props.contextOptions,
						id: state.id,
						page: state.page,
						data: state.data,
					}}
				/>
			);
		}
	}
}

export default RouterInsider;