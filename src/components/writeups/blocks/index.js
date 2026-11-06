// Visual blocks for Markdown reports: a fenced code block whose language is a
// key here is drawn by that component instead of as code (see README.md).
import Flow from './Flow';
import Cards from './Cards';
import Alert from './Alert';
import Severity from './Severity';
import FiveWs from './FiveWs';
import Timeline from './Timeline';
import NetPath from './NetPath';
import Workflow from './Workflow';
import Scenarios from './Scenarios';
import Verdict from './Verdict';
import ProcTree from './ProcTree';

export { default as parseBlock } from './parse';

export const BLOCKS = {
  flow: Flow,
  cards: Cards,
  tools: Cards,
  alert: Alert,
  severity: Severity,
  fivews: FiveWs,
  timeline: Timeline,
  netpath: NetPath,
  workflow: Workflow,
  scenarios: Scenarios,
  verdict: Verdict,
  proctree: ProcTree,
};
