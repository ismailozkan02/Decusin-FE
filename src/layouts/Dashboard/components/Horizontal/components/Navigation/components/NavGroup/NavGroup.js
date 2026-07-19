import { Fragment, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom';
import { Box, Chip, ClickAwayListener, Fade, List, ListItemIcon, Paper, Typography } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import MuiListItem from '@mui/material/ListItem';
import clsx from 'clsx';
import { usePopper } from 'react-popper';
import ChevronDown from 'mdi-material-ui/ChevronDown';
import ChevronRight from 'mdi-material-ui/ChevronRight';
import { THEME } from 'config';
import useTheming from 'hooks/useTheming';
import UserIcon from 'layouts/Dashboard/components/UserIcon';
import CanViewNavGroup from 'layouts/Dashboard/components/acl/CanViewNavGroup';
import { hasActiveChild } from 'layouts/Dashboard/components/utils';
import hexToRGBA from 'utils/hexToRgba';
import NavItems from '../NavItems';

const ListItem = styled(MuiListItem)(({ theme }) => ({
  cursor: 'pointer',
  paddingTop: theme.spacing(2.25),
  paddingBottom: theme.spacing(2.25),
  '&:hover': {
    background: theme.palette.action.hover
  }
}));

const NavigationMenu = styled(Paper)(({ theme }) => ({
  overflowY: 'auto',
  overflowX: 'hidden',
  padding: theme.spacing(2, 0),
  maxHeight: 'calc(100vh - 13rem)',
  backgroundColor: theme.palette.background.paper,
  ...(THEME.MENU_TEXT_TRUNCATE ? { width: 260 } : { minWidth: 260 }),
  '&::-webkit-scrollbar': {
    width: 6
  },
  '&::-webkit-scrollbar-thumb': {
    borderRadius: 20,
    background: hexToRGBA(theme.palette.mode === 'light' ? '#B0ACB5' : '#575468', 0.6)
  },
  '&::-webkit-scrollbar-track': {
    borderRadius: 20,
    background: 'transparent'
  },
  '& .MuiList-root': {
    paddingTop: 0,
    paddingBottom: 0
  },
  '& .menu-group.Mui-selected': {
    borderRadius: 0,
    backgroundColor: theme.palette.action.hover
  }
}));

const NavGroup = ({ item, hasParent }) => {
  const theme = useTheme();
  const { skin } = useTheming();
  const location = useLocation();
  const popperOffsetHorizontal = -22;
  const popperPlacement = 'bottom-start';
  const popperPlacementSubMenu = 'right-start';
  const [menuOpen, setMenuOpen] = useState(false);
  const [popperElement, setPopperElement] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [referenceElement, setReferenceElement] = useState(null);

  const { styles, attributes, update } = usePopper(referenceElement, popperElement, {
    placement: hasParent ? popperPlacementSubMenu : popperPlacement,
    modifiers: [
      {
        name: 'offset',
        enabled: true,
        options: {
          offset: hasParent ? [-8, 15] : [popperOffsetHorizontal, 5]
        }
      },
      {
        name: 'flip',
        enabled: true,
        options: {
          boundary: window,
          fallbackPlacements: ['auto-start', 'right']
        }
      }
    ]
  });

  const handleGroupOpen = e => {
    setAnchorEl(e.currentTarget);
    setMenuOpen(true);
    update ? update() : null;
  };

  const handleGroupClose = () => {
    setAnchorEl(null);
    setMenuOpen(false);
  };

  const handleMenuToggleOnClick = e => {
    if (anchorEl) {
      handleGroupClose();
    } else {
      handleGroupOpen(e);
    }
  };

  useEffect(() => {
    handleGroupClose()
  }, [location.pathname]);

  const IconTag = item.icon ? item.icon : THEME.NAV_SUB_ITEM_ICON;
  const ToggleIcon = ChevronRight;
  const WrapperCondition = THEME.HORIZONTAL_MENU_TOGGLE === 'click';
  const MainWrapper = WrapperCondition ? ClickAwayListener : 'div';
  const ChildWrapper = WrapperCondition ? 'div' : Fragment;
  const AnimationWrapper = THEME.HORIZONTAL_MENU_ANIMATION ? Fade : Fragment;

  const childMenuGroupStyles = () => {
    if (attributes && attributes.popper) {
      if (attributes.popper['data-popper-placement'] === 'right-start') {
        return 'left';
      }

      if (attributes.popper['data-popper-placement'] === 'left-start') {
        return 'right';
      }
    }
  };

  return (
    <CanViewNavGroup navGroup={item}>
      <MainWrapper {...(WrapperCondition ? { onClickAway: handleGroupClose } : { onMouseLeave: handleGroupClose })}>
        <ChildWrapper>
          <List component={'div'} sx={{ py: skin === 'bordered' ? 2.625 : 2.75 }}>
            <ListItem
              aria-haspopup={'true'}
              {...(!WrapperCondition && { onMouseEnter: handleGroupOpen })}
              className={clsx('menu-group', { 'Mui-selected': hasActiveChild(item, location.pathname) })}
              {...(THEME.HORIZONTAL_MENU_TOGGLE === 'click' ? { onClick: handleMenuToggleOnClick } : {})}
              sx={{
                ...(menuOpen ? { backgroundColor: theme.palette.action.hover } : {}),
                ...(!hasParent
                  ? {
                    px: 5.5,
                    borderRadius: 3.5,
                    '&.Mui-selected': {
                      boxShadow: 3,
                      backgroundImage: theme =>
                        `linear-gradient(98deg, ${theme.palette.customColors.primaryGradient}, ${theme.palette.primary.main} 94%)`,
                      '& .MuiTypography-root, & .MuiListItemIcon-root, & .MuiSvgIcon-root': {
                        color: 'common.white'
                      }
                    }
                  }
                  : { px: 5 })
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
                ref={setReferenceElement}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'row',
                    ...(THEME.MENU_TEXT_TRUNCATE && { overflow: 'hidden' })
                  }}
                >
                  <ListItemIcon sx={{ color: 'text.primary', mr: !hasParent ? 2 : 3 }}>
                    <UserIcon
                      icon={IconTag}
                      componentType={'horizontal-menu'}
                      iconProps={{
                        sx: IconTag === THEME.NAV_SUB_ITEM_ICON ? { fontSize: '0.875rem' } : { fontSize: '1.375rem' }
                      }}
                    />
                  </ListItemIcon>
                  <Typography {...(THEME.MENU_TEXT_TRUNCATE && { noWrap: true })}>
                    {item.title}
                  </Typography>
                </Box>
                <Box sx={{ ml: 1.6, display: 'flex', alignItems: 'center' }}>
                  {item.badgeContent ? (
                    <Chip
                      label={item.badgeContent}
                      color={item.badgeColor || 'primary'}
                      sx={{
                        mr: 1.6,
                        height: 20,
                        fontWeight: 500,
                        '& .MuiChip-label': { px: 1.5, textTransform: 'capitalize' }
                      }}
                    />
                  ) : null}
                  {hasParent ? (
                    <ToggleIcon sx={{ fontSize: '1.375rem', color: 'text.primary' }}/>
                  ) : (
                    <ChevronDown sx={{ fontSize: '1.375rem', color: 'text.primary' }}/>
                  )}
                </Box>
              </Box>
            </ListItem>
            <AnimationWrapper {...(THEME.HORIZONTAL_MENU_ANIMATION && {
              in: menuOpen,
              timeout: { exit: 300, enter: 400 }
            })}>
              <Box
                style={styles.popper}
                ref={setPopperElement}
                {...attributes.popper}
                sx={{
                  zIndex: theme.zIndex.appBar,
                  ...(!THEME.HORIZONTAL_MENU_ANIMATION && { display: menuOpen ? 'block' : 'none' }),
                  pl: childMenuGroupStyles() === 'left' ? (skin === 'bordered' ? 2.5 : 2.25) : 0,
                  pr: childMenuGroupStyles() === 'right' ? (skin === 'bordered' ? 2.5 : 2.25) : 0,
                  ...(hasParent ? { position: 'fixed !important' } : { pt: skin === 'bordered' ? 5.5 : 5.75 })
                }}
              >
                <NavigationMenu
                  sx={{
                    ...(hasParent ? { overflowY: 'auto', overflowX: 'visible', maxHeight: 'calc(100vh - 21rem)' } : {}),
                    ...(skin === 'bordered'
                      ? { boxShadow: theme.shadows[0], border: `1px solid ${theme.palette.divider}` }
                      : { boxShadow: theme.shadows[4] })
                  }}
                >
                  <NavItems hasParent items={item.children}/>
                </NavigationMenu>
              </Box>
            </AnimationWrapper>
          </List>
        </ChildWrapper>
      </MainWrapper>
    </CanViewNavGroup>
  );
};

export default NavGroup;
