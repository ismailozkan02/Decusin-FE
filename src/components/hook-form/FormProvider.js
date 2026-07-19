import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { FormProvider as Provider } from 'react-hook-form';

const FormProvider = forwardRef(({ children, onSubmit, methods, ...rest }, ref) => (
  <Provider {...methods}>
    <form ref={ref} onSubmit={onSubmit} {...rest}>{children}</form>
  </Provider>
));

FormProvider.propTypes = {
  children: PropTypes.node.isRequired,
  methods: PropTypes.object.isRequired,
  onSubmit: PropTypes.func
};

FormProvider.displayName = 'FormProvider';

export default FormProvider;
