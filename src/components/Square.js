function Square(props) {
	return (
		<button className="square" onClick={props.onClick}>
			{props.bomb ? 'xx' : props.value}
		</button>
	);
}

export default Square;