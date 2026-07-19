import { Grid } from '@mui/material';
import BriefcaseVariantOutline from 'mdi-material-ui/BriefcaseVariantOutline';
import ApexChartWrapper from 'styles/libs/react-apexcharts';
import CrmTotalSales from './components/CrmTotalSales';
import CrmWeeklySales from './components/CrmWeeklySales';
import CrmTotalGrowth from './components/CrmTotalGrowth';
import CrmUpgradePlan from './components/CrmUpgradePlan';
import CrmRevenueReport from './components/CrmRevenueReport';
import CrmSalesOverview from './components/CrmSalesOverview';
import CrmStatisticsCard from './components/CrmStatisticsCard';
import CrmMeetingSchedule from './components/CrmMeetingSchedule';
import CrmDeveloperMeetup from './components/CrmDeveloperMeetup';
import CrmActivityTimeline from './components/CrmActivityTimeline';
import CardStatisticsCharacter from './components/CardStats/WithImage';
import CardStatisticsVerticalComponent from './components/CardStats/Vertical';
import Page from 'components/Page';
import useLocale from 'hooks/useLocale';

const data = [
  {
    stats: '13.7k',
    title: 'Ratings',
    trendNumber: '+38%',
    chipColor: 'primary',
    chipText: 'Year of 2022',
    src: '/images/cards/pose_f9.png'
  },
  {
    stats: '24.5k',
    trend: 'negative',
    title: 'Sessions',
    trendNumber: '-22%',
    chipText: 'Last Week',
    chipColor: 'secondary',
    src: '/images/cards/pose_m18.png'
  }
];

const Overview = () => {
  const { formatMessage } = useLocale();

  return (
    <Page noHeader title={formatMessage('nav.overview', 'Overview')}>
      <ApexChartWrapper>
        <Grid container spacing={6}>
          <Grid item xs={12} sm={6} md={3}>
            <CardStatisticsCharacter data={data[0]}/>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <CardStatisticsCharacter data={data[1]}/>
          </Grid>
          <Grid item xs={12} md={6}>
            <CrmStatisticsCard/>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <CrmTotalSales/>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <CrmRevenueReport/>
          </Grid>
          <Grid item xs={12} md={6}>
            <CrmSalesOverview/>
          </Grid>
          <Grid item xs={12} md={6}>
            <CrmActivityTimeline/>
          </Grid>
          <Grid item xs={12} md={6}>
            <Grid container spacing={6}>
              <Grid item xs={12} sm={8}>
                <CrmWeeklySales/>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Grid container spacing={6}>
                  <Grid item xs={6} sm={12}>
                    <CrmTotalGrowth/>
                  </Grid>
                  <Grid item xs={6} sm={12}>
                    <CardStatisticsVerticalComponent
                      stats='862'
                      trend='negative'
                      trendNumber='-18%'
                      title='New Project'
                      subtitle='Yearly Project'
                      icon={<BriefcaseVariantOutline/>}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <CrmMeetingSchedule/>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <CrmDeveloperMeetup/>
          </Grid>
        </Grid>
      </ApexChartWrapper>
    </Page>
  );
};

export default Overview;
