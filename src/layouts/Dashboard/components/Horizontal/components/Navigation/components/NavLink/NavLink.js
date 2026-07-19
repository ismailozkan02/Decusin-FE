import { Fragment } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { styled } from '@mui/material/styles';
import { Box, Chip, List, ListItem as MuiListItem, ListItemIcon, Typography } from '@mui/material';
import { THEME } from 'config';
import useTheming from 'hooks/useTheming';
import UserIcon from 'layouts/Dashboard/components/UserIcon';
import CanViewNavLink from 'layouts/Dashboard/components/acl/CanViewNavLink';
import hexToRGBA from 'utils/hexToRgba';

const ListItem = styled(MuiListItem)(({ theme }) => ({
  width: 'auto',
  paddingTop: theme.spacing(2.25),
  color: theme.palette.text.primary,
  paddingBottom: theme.spacing(2.25),
  '&:hover': {
    backgroundColor: theme.palette.action.hover
  },
  '&.active, &.active:hover': {
    backgroundColor: hexToRGBA(theme.palette.primary.main, 0.08)
  },
  '&.active .MuiTypography-root, &.active .MuiListItemIcon-root': {
    color: theme.palette.primary.main
  }
}));

const NavLink = ({ item, hasParent }) => {
  const location = useLocation();
  const { skin } = useTheming();
  const IconTag = item.icon ? item.icon : THEME.NAV_SUB_ITEM_ICON;
  const Wrapper = !hasParent ? List : Fragment;

  const isNavLinkActive = () => location.pathname === item.path || location.pathname.indexOf(`${item.path}/`) === 0;

  return (
    <CanViewNavLink navLink={item}>
      <Wrapper {...(!hasParent ? { component: 'div', sx: { py: skin === 'bordered' ? 2.625 : 2.75 } } : {})}>
        <ListItem
          className={clsx({ active: isNavLinkActive() })}
          component={RouterLink}
          to={`${item.path}`}
          {...(item?.target === 'blank' ? { target: '_blank' } : null)}
          disabled={item.disabled}
          onClick={e => {
            if (item.path === undefined) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
          sx={{
            ...(item.disabled ? { pointerEvents: 'none' } : { cursor: 'pointer' }),
            ...(!hasParent
              ? {
                px: 5.5,
                borderRadius: 3.5,
                '&.active, &.active:hover': {
                  boxShadow: 3,
                  backgroundImage: theme =>
                    `linear-gradient(98deg, ${theme.palette.customColors.primaryGradient}, ${theme.palette.primary.main} 94%)`,
                  '& .MuiTypography-root, & .MuiListItemIcon-root': {
                    color: 'common.white'
                  }
                }
              }
              : { px: 5 })
          }}
        >
          <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                ...(THEME.MENU_TEXT_TRUNCATE && { overflow: 'hidden' })
              }}
            >
              <ListItemIcon sx={{ color: 'text.primary', mr: !hasParent ? 2 : 3 }}>
                <UserIcon
                  icon={IconTag}
                  componentType='horizontal-menu'
                  iconProps={{ sx: IconTag === THEME.NAV_SUB_ITEM_ICON ? { fontSize: '0.875rem' } : { fontSize: '1.375rem' } }}
                />
              </ListItemIcon>
              <Typography {...(THEME.MENU_TEXT_TRUNCATE && { noWrap: true })}>
                {item.title}
              </Typography>
            </Box>
            {item.badgeContent && (
              <Chip
                label={item.badgeContent}
                color={item.badgeColor || 'primary'}
                sx={{
                  ml: 1.6,
                  height: 20,
                  fontWeight: 500,
                  '& .MuiChip-label': { px: 1.5, textTransform: 'capitalize' }
                }}
              />
            )}
          </Box>
        </ListItem>
      </Wrapper>
    </CanViewNavLink>
  );
};

export default NavLink;
