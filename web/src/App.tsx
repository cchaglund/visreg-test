import './styles/app.css';
import Header from './components/navigation/header';
import stylex from '@stylexjs/stylex';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';


const wrapper = stylex.create({
	assessmentPage: {
		width: '100%',
	},
	box: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'space-between',
		width: '100%',
		'@media (max-width: 1000px)': {
			justifyContent: 'flex-start',
		},
	}
});


const App = () => {
	return (
		<Box id="app" {...stylex.props(wrapper.box)} bgcolor={'background.default'}>
			<Header />
			<Outlet />
			<div/>
		</Box>
	);
};

export default App;
