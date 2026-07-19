import PropTypes from 'prop-types';
import { Controller, useFormContext } from 'react-hook-form';
import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';

const RHFCheckbox = ({ name, ...rest }) => {
  const { control } = useFormContext();

  return (
    <FormControlLabel
      control={
        <Controller
          name={name}
          control={control}
          render={({ field }) => <Checkbox {...field} checked={field.value}/>}
        />
      }
      {...rest}
    />
  );
};

RHFCheckbox.propTypes = {
  name: PropTypes.string
};

const RHFMultiCheckbox = ({ name, options, optionLabels, ...rest }) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const onSelected = option => field.value.includes(option)
          ? field.value.filter((value) => value !== option)
          : [...field.value, option];

        return (
          <FormGroup>
            {options.map((option, index) => (
              <FormControlLabel
                key={option}
                control={
                  <Checkbox
                    checked={field.value.includes(option)}
                    onChange={() => field.onChange(onSelected(option))}
                  />
                }
                label={Array.isArray(optionLabels) && optionLabels?.length ? optionLabels[index] : option}
                {...rest}
              />
            ))}
          </FormGroup>
        );
      }}
    />
  );
};

RHFMultiCheckbox.propTypes = {
  name: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.string),
  optionLabels: PropTypes.arrayOf(PropTypes.string)
};

export { RHFCheckbox, RHFMultiCheckbox };