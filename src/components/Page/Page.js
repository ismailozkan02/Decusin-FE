import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';
import { Box } from '@mui/material';
import { Header } from 'components/Page/components';
import useSettings from 'hooks/useSettings';

const Page = forwardRef(({ children, title = '', mainTitle, headerTitle, actions = [], meta, noHeader = false, ...rest }, ref) => {
  const { system: { title: systemTitle } } = useSettings();

  return (
    <>
      <Helmet>
        <title>{`${title}${mainTitle ? ` | ${mainTitle}` : ''} | ${systemTitle}`}</title>
        {meta}
      </Helmet>
      <Box ref={ref} {...rest}>
        {
          !noHeader && (
            <Header mainTitle={mainTitle} title={headerTitle || title} actions={actions}/>
          )
        }
        {children}
      </Box>
    </>
  );
});

Page.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  mainTitle: PropTypes.string,
  // headerTitle: PropTypes.oneOfType(PropTypes.string, PropTypes.object),
  meta: PropTypes.node,
  noHeader: PropTypes.bool
};

export default Page;
