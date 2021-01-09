import React, { useEffect } from 'react';
import { Sidebar } from './UI/Sidebar';
import { YearSlider } from './UI/YearSlider';
import { ClassLineChart } from './Charts/LineChart';
import { ClassBarChart } from './Charts/BarChart';
import { ClassAreaChart } from './Charts/AreaChart';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import { Controls } from './UI/Controls';
import {
  CHARTTYPE,
  NUMMODE,
  determineDataTypeMode,
  APIResponse
} from '../types';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import {
  investigatorList,
  investigatorClassColor
} from '../lookups/investigatorList';
import {
  getClassDistributionByDate,
  getClassSumByDate
} from '../utils/requests';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 1
  },
  viewWrapper: {
    // justifyContent: 'center'
  },
  appBar: {
    top: 'auto',
    bottom: 0
  },
  chartBundle: {
    width: '1000px',
    justify: 'right',
    float: 'right'
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120
  },
  control: {
    marginLeft: 'auto'
  },
  selectEmpty: {
    marginTop: theme.spacing(2)
  }
}));
function TabPanel(props: TabPanelProps) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { children, value, index, ...other } = props;

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <div>{children}</div>
        </Box>
      )}
    </div>
  );
}

type Props = {
  dataMode: boolean;
  chartType: CHARTTYPE;
  setChartType: (type: CHARTTYPE) => void;
  year: number;
  handleSetYear: (event: any, year: number) => void;
  setMode: (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => void;
  totalTab: number;
  switchToTotalTab: (event: React.ChangeEvent, newTab: number) => void;
};

export const TotalCount = ({
  dataMode,
  chartType,
  setChartType,
  setMode,
  year,
  handleSetYear,
  totalTab,
  switchToTotalTab
}: Props): React.ReactElement => {
  const [investigatorClass, setInvestigatorClass] = React.useState('all');
  const changeInvestigatorClass = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setInvestigatorClass(event.target.value as string);
  };
  const [selectedClassDist, chooseClassDist] = React.useState<APIResponse>();
  const [selectedClassSum, chooseClassSum] = React.useState<APIResponse>();

  const selectedYear = year.toString();

  useEffect(() => {
    const fetchData = async () => {
      const result: APIResponse = (await getClassDistributionByDate(
        investigatorClass
      )) as APIResponse;
      chooseClassDist(result);
    };
    fetchData().catch((e) => console.log(e));
  }, [investigatorClass]);

  useEffect(() => {
    const fetchData = async () => {
      const result: APIResponse = (await getClassSumByDate(
        investigatorClass
      )) as APIResponse;
      chooseClassSum(result);
    };
    fetchData().catch((e) => console.log(e));
  }, [investigatorClass]);

  const investigatorClassList = Object.keys(investigatorClassColor).map(
    (entry) => ({
      name: entry,
      color: investigatorClassColor[entry] as string
    })
  );
  const dataType = determineDataTypeMode(dataMode);
  const color =
    investigatorClass === 'all'
      ? '#000000'
      : (investigatorClassColor[investigatorClass] as string);
  const classes = useStyles();

  return (
    <div>
      <Paper className={classes.root}>
        <Tabs
          value={totalTab}
          onChange={switchToTotalTab}
          indicatorColor='primary'
          textColor='primary'
          centered
        >
          <Tab label='Class Totals' />
          <Tab label='Class Sum' />
        </Tabs>
      </Paper>
      <TabPanel value={totalTab} index={0}>
        <div className={classes.viewWrapper}>
          <FormControl className={classes.formControl}>
            <InputLabel id='demo-simple-select-label'>Class</InputLabel>
            <Select
              labelId='demo-simple-select-label'
              id='demo-simple-select'
              value={investigatorClass}
              onChange={changeInvestigatorClass}
            >
              {investigatorClassList.map((cls) => (
                <MenuItem key={cls.name} value={cls.name}>
                  {cls.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <div className={classes.chartBundle}>
            <Controls
              dataMode={dataMode}
              setRelMode={setMode}
              chartType={chartType}
              setChartType={setChartType}
            />
            {selectedClassDist &&
              selectedClassDist[dataType] &&
              (chartType === CHARTTYPE.BAR ? (
                <ClassBarChart
                  input={selectedClassDist[dataType][selectedYear]}
                  ids={[investigatorClass]}
                  color={color}
                  dataMode={dataMode}
                  numMode={NUMMODE.DIST}
                />
              ) : chartType === CHARTTYPE.LINE ? (
                <ClassLineChart
                  input={selectedClassDist[dataType][selectedYear]}
                  ids={[investigatorClass]}
                  color={color}
                  dataMode={dataMode}
                  numMode={NUMMODE.DIST}
                />
              ) : (
                <ClassAreaChart
                  input={selectedClassDist[dataType][selectedYear]}
                  ids={[investigatorClass]}
                  color={color}
                  dataMode={dataMode}
                  numMode={NUMMODE.DIST}
                />
              ))}
            <YearSlider handleSetYear={handleSetYear} year={year} />
          </div>
        </div>
      </TabPanel>
      <TabPanel value={totalTab} index={1}>
        <div className={classes.viewWrapper}>
          <div className={classes.chartBundle}>
            <Controls
              dataMode={dataMode}
              setRelMode={setMode}
              chartType={chartType}
              setChartType={setChartType}
            />
            {selectedClassSum &&
              selectedClassSum[dataType] &&
              (chartType === CHARTTYPE.BAR ? (
                <ClassBarChart
                  input={selectedClassSum[dataType][selectedYear]}
                  ids={[investigatorClass]}
                  color={color}
                  dataMode={dataMode}
                  numMode={NUMMODE.SUM}
                />
              ) : chartType === CHARTTYPE.LINE ? (
                <ClassLineChart
                  input={selectedClassSum[dataType][selectedYear]}
                  ids={[investigatorClass]}
                  color={color}
                  dataMode={dataMode}
                  numMode={NUMMODE.SUM}
                />
              ) : (
                <ClassAreaChart
                  input={selectedClassSum[dataType][selectedYear]}
                  ids={[investigatorClass]}
                  color={color}
                  dataMode={dataMode}
                  numMode={NUMMODE.SUM}
                />
              ))}
            <YearSlider handleSetYear={handleSetYear} year={year} />
          </div>
        </div>
      </TabPanel>
    </div>
  );
};
