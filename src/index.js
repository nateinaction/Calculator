import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from 'redux-thunk';
import React, { PropTypes } from 'react';
import { Provider, connect } from 'react-redux'
import { render } from 'react-dom';
import { PageHeader, Col, Button, Well } from 'react-bootstrap';
import './index.scss';

/*
 * Example Object
 */
/*
{
	entry: 44,
	operation: 'multiply',
	total: 220,
	showTotal: true
}
*/

/*
 * Redux Action Creators
 */

// clear
const allClear = () => ({
	type: 'ALL_CLEAR'
})

const clearEntry = () => ({
	type: 'CLEAR_ENTRY'
})

// set
const setEntry = (entry) => ({
	type: 'SET_ENTRY',
	entry
})

const setOperation = (operation) => ({
	type: 'SET_OPERATION',
	operation
})

const setTotal = (total, operation) => {
	operation = operation ? operation : null;
	return ({
		type: 'SET_TOTAL',
		total,
		operation
	})
}

// operations
const addToTotal = (entry, operation) => ({
	type: 'ADD_TO_TOTAL',
	entry,
	operation
})

const subtractFromTotal = (entry, operation) => ({
	type: 'SUBTRACT_FROM_TOTAL',
	entry,
	operation
})

const multiplyWithTotal = (entry, operation) => ({
	type: 'MULTIPLY_WITH_TOTAL',
	entry,
	operation
})

const divideFromTotal = (entry, operation) => ({
	type: 'DIVIDE_FROM_TOTAL',
	entry,
	operation
})

// async with thunk
const appendToEntry = (input) => {
	return (dispatch, getState) => {
    const state = getState()
    let entry = state.entry
    entry += input.toString()
		entry = parseInt(entry, 10)

		return dispatch(setEntry(entry))
	}
}

const performOperation = (operation) => {
	return (dispatch, getState) => {
    const state = getState()
    const entry = state.entry
    const total = state.total
    const previousOperation = state.operation

    if (entry === 0) {
			return dispatch(setOperation(operation))
		}
		if (total === 0) {
			return dispatch(setTotal(entry, operation))
		}
		switch (previousOperation) {
			case 'add': return dispatch(addToTotal(entry, operation))
			case 'subtract': return dispatch(subtractFromTotal(entry, operation))
			case 'multiply': return dispatch(multiplyWithTotal(entry, operation))
			case 'divide': return dispatch(divideFromTotal(entry, operation))
			default: return state;
		}
	}
}

const showTotal = () => {
	return (dispatch, getState) => {
		const state = getState()
		dispatch(performOperation(state.operation))
  }
}

/*
 * Redux Reducers
 */

const entry = (state = 0, action) => {
	switch (action.type) {
		case 'ALL_CLEAR':
		case 'CLEAR_ENTRY':
		case 'ADD_TO_TOTAL':
		case 'SUBTRACT_FROM_TOTAL':
		case 'MULTIPLY_WITH_TOTAL':
		case 'DIVIDE_FROM_TOTAL':
		case 'SET_TOTAL':
			return 0
		case 'SET_ENTRY':
			return action.entry
		default:
			return state
	}
}

const operation = (state = null, action) => {
	switch (action.type) {
		case 'ALL_CLEAR':
			return null
		case 'ADD_TO_TOTAL':
		case 'SUBTRACT_FROM_TOTAL':
		case 'MULTIPLY_WITH_TOTAL':
		case 'DIVIDE_FROM_TOTAL':
		case 'SET_TOTAL':
		case 'SET_OPERATION':
			return action.operation
		default:
			return state
	}
}

const total = (state = 0, action) => {
	switch (action.type) {
		case 'ALL_CLEAR':
			return 0
		case 'ADD_TO_TOTAL':
			return state + action.entry
		case 'SUBTRACT_FROM_TOTAL':
			return state - action.entry
		case 'MULTIPLY_WITH_TOTAL':
			return state * action.entry
		case 'DIVIDE_FROM_TOTAL':
			return state / action.entry
		case 'SET_TOTAL':
			return action.total
		default:
			return state
	}
}

const displayTotal = (state = true, action) => {
	switch (action.type) {
		case 'ALL_CLEAR':
		case 'ADD_TO_TOTAL':
		case 'SUBTRACT_FROM_TOTAL':
		case 'MULTIPLY_WITH_TOTAL':
		case 'DIVIDE_FROM_TOTAL':
		case 'SET_TOTAL':
		case 'SHOW_TOTAL':
			return true
		case 'CLEAR_ENTRY':
		case 'SET_ENTRY':
		case 'SHOW_ENTRY':
			return false
		default:
			return state
	}
}

const calculatorApp = combineReducers({
	entry,
	operation,
	total,
	displayTotal
})

/*
 * Redux Store
 */

let store = createStore(calculatorApp, applyMiddleware(thunk))

/*
 * React Presentational Components
 */

const Header = (props) => (
	<PageHeader>FCC Calculator <small>with React + Redux</small></PageHeader>
)

const ButtonCommand = (props) => (
	<Button
		bsStyle={props.bsStyle}
		block
		onClick={() => props.onClick()} >
		{props.contents}
	</Button>
)
ButtonCommand.propTypes = {
	onClick: PropTypes.func.isRequired,
	bsStyle: PropTypes.string.isRequired,
	contents: PropTypes.string.isRequired
}

const ButtonOperation = (props) => (
	<Button
		block
		bsStyle={props.operation === props.operationState ? 'primary' : 'info'}
		onClick={() => props.onClick(props.operation)} >
		{props.visualSymbol}
	</Button>
)
ButtonOperation.propTypes = {
	operation: PropTypes.string.isRequired,
	operationState: PropTypes.string,
	onClick: PropTypes.func.isRequired,
	visualSymbol: PropTypes.string.isRequired
}

const ButtonNumber = (props) => (
	<Button
		block
		onClick={() => props.onClick(props.number)} >
		{props.number}
	</Button>
)
ButtonNumber.propTypes = {
	number: PropTypes.number.isRequired,
	onClick: PropTypes.func.isRequired
}

const CalculatorDisplay = (props) => (
	<Col className='calculator-column' xs={12} md={6} mdOffset={3}>
		<Well className='lead text-right'>
			{(props.displayTotal) ? props.total : props.entry}
		</Well>
	</Col>
)
CalculatorDisplay.propTypes = {
	entry: PropTypes.number.isRequired
}

const CalculatorButtons = (props) => (
	<Col id='calculator-buttons' xs={12} md={6} mdOffset={3}>
  	<Col className='calculator-column' xs={3}>
  		<ButtonCommand contents='AC' bsStyle='danger' onClick={props.handleAllClearClick} />
  		<ButtonNumber number={7} onClick={props.handleAppendToEntry} />
  		<ButtonNumber number={4} onClick={props.handleAppendToEntry} />
  		<ButtonNumber number={1} onClick={props.handleAppendToEntry} />
  		<ButtonNumber number={0} onClick={props.handleAppendToEntry} />
  	</Col>
  	<Col className='calculator-column' xs={3}>
  		<ButtonCommand contents='CE' bsStyle='warning' onClick={props.handleClearEntryClick} />
  		<ButtonNumber number={8} onClick={props.handleAppendToEntry} />
  		<ButtonNumber number={5} onClick={props.handleAppendToEntry} />
  		<ButtonNumber number={2} onClick={props.handleAppendToEntry} />
  	</Col>
  	<Col className='calculator-column' xs={3}>
  		<ButtonCommand contents='=' bsStyle='success' onClick={props.handleShowTotal} />
  		<ButtonNumber number={9} onClick={props.handleAppendToEntry} />
  		<ButtonNumber number={6} onClick={props.handleAppendToEntry} />
  		<ButtonNumber number={3} onClick={props.handleAppendToEntry} />
  	</Col>
  	<Col className='calculator-column' xs={3}>
  		<ButtonOperation visualSymbol='+' operation='add' operationState={props.operation} onClick={props.handlePerformOperation} />
 			<ButtonOperation visualSymbol='–' operation='subtract' operationState={props.operation} onClick={props.handlePerformOperation} />
			<ButtonOperation visualSymbol='x' operation='multiply' operationState={props.operation} onClick={props.handlePerformOperation} />
			<ButtonOperation visualSymbol='÷' operation='divide' operationState={props.operation} onClick={props.handlePerformOperation} />
  	</Col>
  </Col>
)
CalculatorButtons.propTypes = {
	operation: PropTypes.string,
	handleAllClearClick: PropTypes.func.isRequired,
	handleClearEntryClick: PropTypes.func.isRequired,
	handleAppendToEntry: PropTypes.func.isRequired,
	handlePerformOperation: PropTypes.func.isRequired,
	handleShowTotal: PropTypes.func.isRequired
}

/*
 * React-Redux Container Components
 */

const mapStateToProps = (state) => ({
	operation: state.operation
})

const mapDispatchToProps = (dispatch) => ({
	handleAllClearClick: () => {
		dispatch(allClear())
	},
	handleClearEntryClick: () => {
		dispatch(clearEntry())
	},
	handleAppendToEntry: (input) => {
		dispatch(appendToEntry(input))
	},
	handlePerformOperation: (operation) => {
		dispatch(performOperation(operation))
	},
	handleShowTotal: () => {
		dispatch(showTotal())
	}
})

const CalculatorButtonsContainer = connect(
	mapStateToProps,
	mapDispatchToProps
)(CalculatorButtons)

const mapStateToPropsTwo = (state) => ({
	entry: state.entry,
	total: state.total,
	displayTotal: state.displayTotal
})

const CalculatorDisplayContainer = connect(
	mapStateToPropsTwo
)(CalculatorDisplay)


const App = (props) => (
	<div className="App">
	  <Header />
	  <Col id='calculator' xs={12} md={8} mdOffset={2}>
	  	<CalculatorDisplayContainer />
	  	<CalculatorButtonsContainer />
	  </Col>
  </div>
)

/*
 * React Dom
 */

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);

/*
 * Redux state to console log
 */
/*
console.log('initial state')
console.log(store.getState())
store.subscribe(() => console.log(store.getState()))
*/
/*
 * Redux behavior tests
 */
/*
console.log('entry: 4')
store.dispatch(appendToEntry(4))
console.log('entry: 42')
store.dispatch(appendToEntry(2))
console.log('set operation: divide')
store.dispatch(performOperation('divide'))
console.log('set operation: add')
store.dispatch(setOperation('add'))
console.log('entry: 9')
store.dispatch(appendToEntry(9))
console.log('set operation: subtract')
store.dispatch(performOperation('subtract'))
console.log('entry: 7')
store.dispatch(appendToEntry(7))

console.log('set operation: divide')
store.dispatch(performOperation('divide'))
console.log('entry: 0')
store.dispatch(appendToEntry(0))

console.log('show total')
store.dispatch(showTotal())
console.log('show total')
store.dispatch(showTotal())
console.log('allClear')
store.dispatch(allClear())
console.log('show total')
store.dispatch(showTotal())

console.log('entry: 7')
store.dispatch(appendToEntry(7))
console.log('set operation: subtract')
store.dispatch(performOperation('subtract'))

console.log('show total')
store.dispatch(showTotal())
console.log('entry: 7')
store.dispatch(appendToEntry(7))
*/
