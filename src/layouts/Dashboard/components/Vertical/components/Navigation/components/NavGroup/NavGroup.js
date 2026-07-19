import { Fragment, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import ListItemIcon from '@mui/material/ListItemIcon';
import { styled, useTheme } from '@mui/material/styles';
import ListItemButton from '@mui/material/ListItemButton';
import clsx from 'clsx';
import ChevronLeft from 'mdi-material-ui/ChevronLeft';
import ChevronRight from 'mdi-material-ui/ChevronRight';
import { THEME } from 'config';
import useTheming from 'hooks/useTheming';
import CanViewNavGroup from 'layouts/Dashboard/components/acl/CanViewNavGroup';
import { hasActiveChild, removeChildren } from 'layouts/Dashboard/components/utils';
import UserIcon from 'layouts/Dashboard/components/UserIcon';
import NavSectionTitle from 'layouts/Dashboard/components/Vertical/components/Navigation/components/NavSectionTitle';
import NavItems from '../NavItems';

const MenuItemTextWrapper = styled(Box)(() => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  transition: 'opacity .25s ease-in-out',
  ...(THEME.MENU_TEXT_TRUNCATE && { overflow: 'hidden' })
}));

const MenuGroupToggleRightIcon = styled(ChevronRight)(({ theme }) => ({
  color: theme.palette.text.primary,
  transition: 'transform .25s ease-in-out'
}));

const NavGroup = props => {
  // ** Props
  const {
    item,
    parent,
    navHover,
    isSubToSub,
    navVisible,
    groupActive,
    setGroupActive,
    collapsedNavWidth,
    currentActiveGroup,
    setCurrentActiveGroup,
    navigationBorderWidth
  } = props;

  // ** Hooks & Vars
  const theme = useTheme()
  const location = useLocation();
  const { skin, navCollapsed, verticalNavToggleType } = useTheming();

  // ** Accordion menu group open toggle
  const toggleActiveGroup = (item, parent) => {
    let openGroup = groupActive;

    // ** If NavGroup is already open and clicked, close the group
    if (openGroup.includes(item.title)) {
      openGroup.splice(openGroup.indexOf(item.title), 1);

      // If clicked NavGroup has open group children, Also remove those children to close those groups
      if (item.children) {
        removeChildren(item.children, openGroup, currentActiveGroup);
      }
    } else if (parent) {
      // ** If NavGroup clicked is the child of an open group, first remove all the open groups under that parent
      if (parent.children) {
        removeChildren(parent.children, openGroup, currentActiveGroup);
      }

      // ** After removing all the open groups under that parent, add the clicked group to open group array
      if (!openGroup.includes(item.title)) {
        openGroup.push(item.title);
      }
    } else {
      // ** If clicked on another group that is not active or open, create openGroup array from scratch
      // ** Empty Open NavGroup array
      openGroup = [];

      // ** push Current Active NavGroup To Open NavGroup array
      if (currentActiveGroup.every(elem => groupActive.includes(elem))) {
        openGroup.push(...currentActiveGroup);
      }

      // ** Push current clicked group sale to Open NavGroup array
      if (!openGroup.includes(item.title)) {
        openGroup.push(item.title);
      }
    }

    setGroupActive([...openGroup]);
  };

  const handleGroupClick = () => {
    const openGroup = groupActive;

    if (verticalNavToggleType === 'collapse') {
      if (openGroup.includes(item.title)) {
        openGroup.splice(openGroup.indexOf(item.title), 1);
      } else {
        openGroup.push(item.title);
      }

      setGroupActive([...openGroup]);
    } else {
      toggleActiveGroup(item, parent);
    }
  };

  useEffect(() => {
    if (hasActiveChild(item, location.pathname)) {
      if (!groupActive.includes(item.title)) groupActive.push(item.title);
    } else {
      const index = groupActive.indexOf(item.title);
      if (index > -1) groupActive.splice(index, 1);
    }

    setGroupActive([...groupActive]);
    setCurrentActiveGroup([...groupActive]);

    // Empty Active NavGroup When Menu is collapsed and not hovered, to fix issue route change
    if (navCollapsed && !navHover) {
      setGroupActive([]);
    }

    // eslint-disable-next-line
  }, [location.pathname]);

  useEffect(() => {
    if (navCollapsed && !navHover) {
      setGroupActive([]);
    }

    if (navCollapsed && navHover) {
      setGroupActive([...currentActiveGroup, ...groupActive]);
    }

    // eslint-disable-next-line
  }, [navCollapsed, navHover]);

  const IconTag = parent && !item.icon ? THEME.NAV_SUB_ITEM_ICON : item.icon;
  const menuGroupCollapsedStyles = navCollapsed && !navHover ? { opacity: 0 } : { opacity: 1 };

  const conditionalColor = () => {
    if (skin === 'semi-dark' && theme.palette.mode === 'light') {
      return {
        color: `rgba(${theme.palette.customColors.dark}, 0.68) !important`
      };
    }

    if (skin === 'semi-dark' && theme.palette.mode === 'dark') {
      return {
        color: `rgba(${theme.palette.customColors.light}, 0.68) !important`
      };
    }

    return {
      color: `${theme.palette.text.secondary} !important`
    };
  };

  const conditionalBgColor = () => {
    if (skin === 'semi-dark' && theme.palette.mode === 'light') {
      return {
        color: `rgba(${theme.palette.customColors.dark}, 0.87)`,
        '&:hover': {
          backgroundColor: `rgba(${theme.palette.customColors.dark}, 0.04)`
        },
        '&.Mui-selected': {
          backgroundColor: `rgba(${theme.palette.customColors.dark}, 0.08)`,
          '&:hover': {
            backgroundColor: `rgba(${theme.palette.customColors.dark}, 0.12)`
          }
        }
      };
    }

    if (skin === 'semi-dark' && theme.palette.mode === 'dark') {
      return {
        color: `rgba(${theme.palette.customColors.light}, 0.87)`,
        '&:hover': {
          backgroundColor: `rgba(${theme.palette.customColors.light}, 0.04)`
        },
        '&.Mui-selected': {
          backgroundColor: `rgba(${theme.palette.customColors.light}, 0.08)`,
          '&:hover': {
            backgroundColor: `rgba(${theme.palette.customColors.light}, 0.12)`
          }
        }
      };
    }

    return {
      '&.Mui-selected': {
        backgroundColor: theme.palette.action.hover,
        '&:hover': {
          backgroundColor: theme.palette.action.hover
        }
      }
    };
  };

  return (
    <>
      {
        item?.type === 'section' ? (
          <>
            <NavSectionTitle item={item}/>
            <NavItems
              {...props}
              items={item.children}
              navVisible={navVisible}
            />
          </>
        ) : (
          <CanViewNavGroup navGroup={item}>
            <Fragment>
              <ListItem
                disablePadding
                className={'nav-group'}
                onClick={handleGroupClick}
                sx={{ mt: 1.5, px: '0 !important', flexDirection: 'column' }}
              >
                <ListItemButton
                  className={clsx({
                    'Mui-selected': groupActive.includes(item.title) || currentActiveGroup.includes(item.title)
                  })}
                  sx={{
                    width: '100%',
                    ...conditionalBgColor(),
                    borderTopRightRadius: 100,
                    borderBottomRightRadius: 100,
                    transition: 'padding .25s ease-in-out',
                    ...(parent && !item.children ? { paddingLeft: 5 } : {}),
                    padding: theme.spacing(
                      2.25,
                      3.5,
                      2.25,
                      navCollapsed && !navHover ? (collapsedNavWidth - navigationBorderWidth - 24) / 8 : 5.5
                    )
                  }}
                >
                  {isSubToSub ? null : (
                    <ListItemIcon
                      sx={{
                        color: 'text.primary',
                        transition: 'margin .25s ease-in-out',
                        ...(parent && navCollapsed && !navHover ? {} : { marginRight: 2.5 }),
                        ...(navCollapsed && !navHover ? { marginRight: 0 } : {}),
                        ...(parent && item.children ? { marginLeft: 1.25, marginRight: 3.75 } : {})
                      }}
                    >
                      <UserIcon
                        icon={IconTag}
                        componentType={'vertical-menu'}
                        iconProps={{ sx: { ...(parent ? { fontSize: '0.875rem' } : {}) } }}
                      />
                    </ListItemIcon>
                  )}
                  <MenuItemTextWrapper sx={{ ...menuGroupCollapsedStyles, ...(isSubToSub ? { marginLeft: 9 } : {}) }}>
                    <Typography
                      {...((THEME.MENU_TEXT_TRUNCATE || (!THEME.MENU_TEXT_TRUNCATE && navCollapsed && !navHover)) && {
                        noWrap: true
                      })}
                    >
                      {item.title}
                    </Typography>
                    <Box className={'menu-sale-meta'} sx={{ ml: 0.8, display: 'flex', alignItems: 'center' }}>
                      {item.badgeContent ? (
                        <Chip
                          label={item.badgeContent}
                          color={item.badgeColor || 'primary'}
                          sx={{
                            mr: 0.8,
                            height: 20,
                            fontWeight: 500,
                            '& .MuiChip-label': { px: 1.5, textTransform: 'capitalize' }
                          }}
                        />
                      ) : null}
                      <MenuGroupToggleRightIcon
                        sx={{
                          ...conditionalColor(),
                          ...(groupActive.includes(item.title) ? { transform: 'rotate(90deg)' } : {})
                        }}
                      />
                    </Box>
                  </MenuItemTextWrapper>
                </ListItemButton>
                <Collapse
                  component={'ul'}
                  onClick={e => e.stopPropagation()}
                  in={groupActive.includes(item.title)}
                  sx={{
                    pl: 0,
                    width: '100%',
                    ...menuGroupCollapsedStyles,
                    transition: 'all .25s ease-in-out'
                  }}
                >
                  <NavItems
                    {...props}
                    items={item.children}
                    parent={item}
                    navVisible={navVisible}
                    isSubToSub={parent && item.children ? item : undefined}
                  />
                </Collapse>
              </ListItem>
            </Fragment>
          </CanViewNavGroup>
        )
      }
    </>
  );
};

export default NavGroup;
