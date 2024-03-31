import { Button } from '@mui/material';
import { AppContext } from '../../contexts/app-context';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const TestPage = () => {
    const { suiteName } = useContext(AppContext);
    const navigate = useNavigate();

    // const startTest = async (testType: string) => {
    // };

    return (
        <div>
            <h1>Test Page</h1>
            <Button disabled variant="contained" color="primary" /* onClick={() => startTest('full-test')} */>
                Full test
            </Button>
            <Button disabled variant="contained" color="primary" /* onClick={() => startTest('diffs-only')} */>
                Diffs only
            </Button>
            <Button
                variant="contained"
                color="primary"
                onClick={() => {
                    navigate('/assessment/' + suiteName);
                }}
            >
                Assess existing diffs
            </Button>
        </div>
    );
};

export default TestPage;
