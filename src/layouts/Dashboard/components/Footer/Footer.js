import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/material';
import useTheming from 'hooks/useTheming';
import { Copyright } from './components';

const Footer = ({ showBackdrop }) => {
  const theme = useTheme();
  const { layout, skin, footer, contentWidth } = useTheming();

  if (footer === 'hidden') return null;

  return (
    <Box
      component={'footer'}
      className={'layout-footer'}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: showBackdrop && footer === 'fixed' ? 13 : 10,
        ...(footer === 'fixed' && { bottom: 0, px: [4, 6], position: 'sticky' })
      }}
    >
      <Box
        className={'footer-content-container'}
        sx={{
          py: 4,
          px: [4, 6],
          width: `calc(100% - ${theme.spacing(5)} * 2)`,
          ...(skin === 'bordered' && {
            border: `1px solid ${theme.palette.divider}`,
            borderBottomWidth: 0,
            ...(layout === 'vertical' && contentWidth === 'full' && { borderLeftWidth: 0, borderRightWidth: 0 })
          }),
          ...(contentWidth === 'boxed' ? {
            borderTopLeftRadius: 14,
            borderTopRightRadius: 14
          } : {
            width: '100%'
          }),
          ...(footer === 'fixed' && {
            boxShadow: theme.shadows[skin === 'bordered' ? 0 : 4],
            ...(contentWidth === 'boxed' && {
              '@media (min-width:1440px)': { maxWidth: `calc(1440px - ${theme.spacing(6)} * 2)` }
            })
          })
        }}
      >
        <Copyright/>
      </Box>
    </Box>
  );
};

export default Footer;
