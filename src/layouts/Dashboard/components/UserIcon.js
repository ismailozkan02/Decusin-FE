const UserIcon = ({ icon, iconProps, componentType }) => {
  if (!icon || !componentType) return null;

  const IconTag = icon;

  let styles;

  if (componentType === 'search') {
    // Conditional Props based on component type, like have different font size or icon color
    /* styles = {
          color: 'blue',
          fontSize: '2rem'
        } */
  } else if (componentType === 'vertical-menu') {
    // Conditional Props based on component type, like have different font size or icon color
    /* styles = {
          color: 'red',
          fontSize: '1.5rem'
        } */
  } else if (componentType === 'horizontal-menu') {
    // Conditional Props based on component type, like have different font size or icon color
    /* styles = {
          color: 'green',
          fontSize: '1rem'
        } */
  }

  return (
    <IconTag {...iconProps} style={styles}/>
  );
};

export default UserIcon;
