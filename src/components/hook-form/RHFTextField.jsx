import PropTypes from 'prop-types';
import { Controller, useFormContext } from 'react-hook-form';
import { TextField } from '@mui/material';

const RHFTextField = ({ name, ...rest }) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          fullWidth
          error={!!error}
          helperText={error?.message}
          {...rest}
        />
      )}
    />
  );
};

RHFTextField.propTypes = {
  name: PropTypes.string
};

export default RHFTextField;