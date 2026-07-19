import { IconButton } from '@mui/material';
import WeatherNight from 'mdi-material-ui/WeatherNight'
import WeatherSunny from 'mdi-material-ui/WeatherSunny'
import useTheming from 'hooks/useTheming';

const ModeToggler = () => {
  const { mode, onSave } = useTheming();

  const handleModeToggle = () => {
    onSave('mode', mode === 'light' ? 'dark' : 'light')
  };

  return (
    <IconButton color={'inherit'} aria-haspopup={'true'} onClick={handleModeToggle}>
      {mode === 'dark' ? <WeatherSunny/> : <WeatherNight/>}
    </IconButton>
  );
};

export default ModeToggler;
