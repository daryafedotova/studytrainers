import { ChoiceTask } from './tasks/ChoiceTask.jsx';
import { MultiSelectTask } from './tasks/MultiSelectTask.jsx';
import { FactorTreeTask } from './tasks/FactorTreeTask.jsx';
import { FactorBuilderTask } from './tasks/FactorBuilderTask.jsx';
import { SortTask } from './tasks/SortTask.jsx';
import { NumericTask } from './tasks/NumericTask.jsx';
const renderers={choice:ChoiceTask,multi:MultiSelectTask,'factor-tree':FactorTreeTask,'factor-builder':FactorBuilderTask,sort:SortTask,numeric:NumericTask};
export function TaskRenderer(props){const Renderer=renderers[props.task.type];if(!Renderer)return <p role="alert">Неизвестный тип задания.</p>;return <Renderer {...props}/>;}
