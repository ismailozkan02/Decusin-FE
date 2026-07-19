import { Outlet } from 'react-router-dom';
import { useMediaQuery } from '@mui/material';
import useTheming from 'hooks/useTheming';
import Horizontal from './components/Horizontal';
import Vertical from './components/Vertical';

const Dashboard = () => {
  const { layout } = useTheming();
  const hidden = useMediaQuery(theme => theme.breakpoints.down('lg'));

  if (layout === 'horizontal') {
    return (
      <Horizontal hidden={hidden}>
        <Outlet/>
      </Horizontal>
    );
  }

  return (
    <Vertical hidden={hidden}>
      <Outlet/>
    </Vertical>
  );
};

export default Dashboard;