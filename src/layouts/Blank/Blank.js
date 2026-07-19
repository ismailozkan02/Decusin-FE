import { Outlet } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';
import { Footer } from 'layouts/Blank/components';

const LayoutWrapper = styled(Box)(({ theme }) => ({
  height: '100vh',
  '& .content-center': {
    display: 'flex',
    minHeight: '100vh',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(5)
  },
  '& .content-right': {
    display: 'flex',
    minHeight: '100vh',
    overflowX: 'hidden',
    position: 'relative'
  }
}));

const Blank = () => {
  return (
    <LayoutWrapper className={'layout-wrapper'}>
      <Box className={'app-content'} sx={{ minHeight: '100vh', overflowX: 'hidden', position: 'relative' }}>
        <Outlet/>
        <Footer/>
      </Box>
    </LayoutWrapper>
  );
};

export default Blank;
