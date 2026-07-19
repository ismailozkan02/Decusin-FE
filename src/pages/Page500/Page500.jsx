import { FormattedMessage } from 'react-intl';
import { Link as RouterLink } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { Box, Button, Container, Typography } from '@mui/material';
import { SeverErrorIllustration } from 'assets';
import Page from 'components/Page';
import useLocale from 'hooks/useLocale';

const RootStyle = styled('div')(({ theme }) => ({
  display: 'flex',
  minHeight: '100vh',
  alignItems: 'center',
  paddingTop: theme.spacing(10),
  paddingBottom: theme.spacing(10)
}));

const Page500 = () => {
  const { formatMessage } = useLocale();

  return (
    <Page noHeader title={formatMessage('nav.500', 'Internal Server Error')} sx={{ height: 1 }}>
      <RootStyle>
        <Container>
          <Box sx={{ maxWidth: 480, margin: 'auto', textAlign: 'center' }}>
            <Typography variant={'h3'} paragraph>
              <FormattedMessage id={'label.internal_server_error'} defaultMessage={'Internal Server Error!'}/>
            </Typography>
            <Typography sx={{ color: 'text.secondary' }}>
              <FormattedMessage
                id={'message.internal_server_error'}
                defaultMessage={'There was an error, please try again later.'}
              />
            </Typography>
            <SeverErrorIllustration sx={{ height: 260, my: { xs: 5, sm: 10 } }}/>
            <Button to={'/'} size={'large'} variant={'contained'} component={RouterLink}>
              <FormattedMessage id={'button.go_to_home'} defaultMessage={'Go To Overview'}/>
            </Button>
          </Box>
        </Container>
      </RootStyle>
    </Page>
  );
};

export default Page500;