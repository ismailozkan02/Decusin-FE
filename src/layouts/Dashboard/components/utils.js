export const hasActiveChild = (item, currentURL) => {
  const { children } = item;

  if (!children) {
    return false;
  }

  for (const child of children) {
    if (child.children) {
      if (hasActiveChild(child, currentURL)) {
        return true;
      }
    }

    const childPath = child.path;

    // Check if the child has a link and is active
    if (
      child &&
      childPath &&
      currentURL &&
      (currentURL === childPath || currentURL.indexOf(`${childPath}/`) === 0)
    ) {
      return true;
    }
  }

  return false;
};

export const removeChildren = (children, openGroup, currentActiveGroup) => {
  children.forEach(child => {
    if (!currentActiveGroup.includes(child.title)) {
      const index = openGroup.indexOf(child.title);

      if (index > -1) openGroup.splice(index, 1);

      if (child.children) removeChildren(child.children, openGroup, currentActiveGroup);
    }
  });
};
