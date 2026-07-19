import NavLink from '../NavLink';
import NavGroup from '../NavGroup';

const resolveNavItemComponent = item => {
  if (item.children) return NavGroup;

  return NavLink;
};

const NavItems = ({ items, ...rest }) => {
  if (!Array.isArray(items)) return null;

  const RenderMenuItems = items.map((item, index) => {
    const TagName = resolveNavItemComponent(item);
    const keyValue = `${item.path || item.title || "item"}-${index}`;

    return (
      <TagName {...rest} key={keyValue} item={item}/>
    );
  });

  return (
    <>{RenderMenuItems}</>
  );
};

export default NavItems;
