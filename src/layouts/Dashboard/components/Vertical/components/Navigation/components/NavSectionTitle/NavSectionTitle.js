import Divider from '@mui/material/Divider';
import { styled, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import MuiListSubheader from '@mui/material/ListSubheader';
import useTheming from 'hooks/useTheming';
import CanViewNavGroup from 'layouts/Dashboard/components/acl/CanViewNavGroup';

const ListSubheader = styled(props => <MuiListSubheader component={'li'} {...props} />)(({ theme }) => ({
  lineHeight: 1,
  display: 'flex',
  position: 'relative',
  marginTop: theme.spacing(7),
  marginBottom: theme.spacing(2),
  backgroundColor: 'transparent',
  transition: 'padding-left .25s ease-in-out'
}));

const TypographyHeaderText = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  lineHeight: 'normal',
  letterSpacing: '0.21px',
  textTransform: 'uppercase',
  color: theme.palette.text.disabled,
  fontWeight: theme.typography.fontWeightMedium
}));

const NavSectionTitle = ({ item, navHover, collapsedNavWidth, navigationBorderWidth }) => {
  const theme = useTheme();
  const { skin, navCollapsed } = useTheming();

  const conditionalStyling = () => {
    if (skin === 'semi-dark' && theme.palette.mode === 'light') {
      return {
        color: `rgba(${theme.palette.customColors.dark}, 0.38)`,
        '& .MuiDivider-root:before, & .MuiDivider-root:after, & hr': {
          borderColor: `rgba(${theme.palette.customColors.dark}, ${navCollapsed && !navHover ? 0.3 : 0.12})`
        }
      };
    }

    if (skin === 'semi-dark' && theme.palette.mode === 'dark') {
      return {
        color: `rgba(${theme.palette.customColors.light}, 0.38)`,
        '& .MuiDivider-root:before, & .MuiDivider-root:after, & hr': {
          borderColor: `rgba(${theme.palette.customColors.light}, ${navCollapsed && !navHover ? 0.3 : 0.12})`
        }
      };
    }

    return {
      color: theme.palette.text.disabled,
      '& .MuiDivider-root:before, & .MuiDivider-root:after, & hr': {
        borderColor: `rgba(${theme.palette.customColors.main}, ${navCollapsed && !navHover ? 0.3 : 0.12})`
      }
    };
  }

  return (
    <CanViewNavGroup navGroup={item}>
      <ListSubheader
        className={'nav-section-title'}
        sx={{
          ...conditionalStyling(),
          ...(navCollapsed && !navHover
            ? {
              py: 3.5,
              pr: (collapsedNavWidth - navigationBorderWidth - 24) / 8 - 1,
              pl: (collapsedNavWidth - navigationBorderWidth - 24) / 8 + 0.25
            }
            : { px: 0, py: 1.75 })
        }}
      >
        <Divider
          textAlign={'left'}
          sx={{
            m: 0,
            width: '100%',
            lineHeight: 'normal',
            ...(navCollapsed && !navHover
              ? {}
              : {
                textTransform: 'uppercase',
                '&:before, &:after': { top: 7, transform: 'none' },
                '& .MuiDivider-wrapper': { px: 2.5, fontSize: '0.75rem', letterSpacing: '0.21px' }
              })
          }}
        >
          {navCollapsed && !navHover ? null : (
            <TypographyHeaderText noWrap>
              {item.title}
            </TypographyHeaderText>
          )}
        </Divider>
      </ListSubheader>
    </CanViewNavGroup>
  );
};

export default NavSectionTitle;
