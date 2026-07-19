import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Box, Chip, ListItem, ListItemButton, ListItemIcon, Typography } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { THEME } from 'config';
import useTheming from 'hooks/useTheming';
import UserIcon from 'layouts/Dashboard/components/UserIcon';
import CanViewNavLink from 'layouts/Dashboard/components/acl/CanViewNavLink';

const MenuNavLink = styled(ListItemButton)(({ theme }) => ({
  width: '100%',
  borderTopRightRadius: 100,
  borderBottomRightRadius: 100,
  color: theme.palette.text.primary,
  padding: theme.spacing(2.25, 3.5),
  transition: 'background-color .2s ease, color .2s ease, box-shadow .2s ease',
  '&.active, &.active:hover': {
    boxShadow: theme.shadows[3],
    backgroundColor: theme.palette.primary.main,
    backgroundImage: 'none',
    color: theme.palette.common.white
  },
  '&.active .MuiTypography-root, &.active .MuiSvgIcon-root': {
    color: `${theme.palette.common.white} !important`
  },
  '&.active .MuiListItemIcon-root': {
    color: `${theme.palette.common.white} !important`
  }
}));

const MenuItemTextMetaWrapper = styled(Box)({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  transition: 'opacity .25s ease-in-out',
  ...(THEME.MENU_TEXT_TRUNCATE && { overflow: 'hidden' })
});

const NavLink = ({
                   item,
                   parent,
                   navHover,
                   navVisible,
                   isSubToSub,
                   collapsedNavWidth,
                   toggleNavVisibility,
                   navigationBorderWidth
                 }) => {
  const theme = useTheme();
  const { skin, navCollapsed } = useTheming();
  const IconTag = parent && !item.icon ? THEME.NAV_SUB_ITEM_ICON : item.icon;
  const location = useLocation();

  const conditionalBgColor = () => {
    if (skin === 'semi-dark' && theme.palette.mode === 'light') {
      return {
        color: `rgba(${theme.palette.customColors.dark}, 0.87)`,
        '&:hover': {
          backgroundColor: `rgba(${theme.palette.customColors.dark}, 0.04)`
        }
      }
    } else if (skin === 'semi-dark' && theme.palette.mode === 'dark') {
      return {
        color: `rgba(${theme.palette.customColors.light}, 0.87)`,
        '&:hover': {
          backgroundColor: `rgba(${theme.palette.customColors.light}, 0.04)`
        }
      }
    } else return {}
  }

  const isNavLinkActive = () => location.pathname === item.path || location.pathname.indexOf(`${item.path}/`) === 0;

  return (
    <CanViewNavLink navLink={item}>
      <ListItem
        disablePadding
        className={'nav-link'}
        disabled={item.disabled || false}
        sx={{ mt: 1.5, px: '0 !important' }}
      >
        <MenuNavLink
          className={isNavLinkActive() ? 'active' : ''}
          component={RouterLink}
          to={item.path === undefined ? '/' : `${item.path}`}
          {...(item?.target === 'blank' ? { target: '_blank' } : null)}
          onClick={e => {
            if (item.path === undefined) {
              e.preventDefault();
              e.stopPropagation();
            }
            if (navVisible) {
              toggleNavVisibility();
            }
          }}
          sx={{
            ...conditionalBgColor(),
            ...(item.disabled ? { pointerEvents: 'none' } : { cursor: 'pointer' }),
            pl: navCollapsed && !navHover ? (collapsedNavWidth - navigationBorderWidth - 24) / 8 : 5.5
          }}
        >
          {isSubToSub ? null : (
            <ListItemIcon
              sx={{
                color: 'text.primary',
                transition: 'margin .25s ease-in-out',
                ...(navCollapsed && !navHover ? { mr: 0 } : { mr: 2.5 }),
                ...(parent ? { ml: 1.25, mr: 3.75 } : {}) // This line should be after (navCollapsed && !navHover) condition for proper styling
              }}
            >
              <UserIcon
                icon={IconTag}
                componentType={'vertical-menu'}
                iconProps={{
                  sx: {
                    fontSize: '0.875rem',
                    ...(!parent ? { fontSize: '1.5rem' } : {}),
                    ...(parent && item.icon ? { fontSize: '0.875rem' } : {})
                  }
                }}
              />
            </ListItemIcon>
          )}
          <MenuItemTextMetaWrapper
            sx={{
              ...(isSubToSub ? { marginLeft: 9 } : {}),
              ...(navCollapsed && !navHover ? { opacity: 0 } : { opacity: 1 })
            }}
          >
            <Typography
              {...((THEME.MENU_TEXT_TRUNCATE || (!THEME.MENU_TEXT_TRUNCATE && navCollapsed && !navHover)) && {
                noWrap: true
              })}
            >
              {item.title}
            </Typography>
            {item.badgeContent ? (
              <Chip
                label={item.badgeContent}
                color={item.badgeColor || 'primary'}
                sx={{
                  height: 20,
                  fontWeight: 500,
                  marginLeft: 1.25,
                  '& .MuiChip-label': { px: 1.5, textTransform: 'capitalize' }
                }}
              />
            ) : null}
          </MenuItemTextMetaWrapper>
        </MenuNavLink>
      </ListItem>
    </CanViewNavLink>
  );
};

export default NavLink
