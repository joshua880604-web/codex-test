import { searchTasks } from '@/lib/keyword-targets';
import { routeFor } from '@/lib/catalog';
export default function SearchTasks({id}:{id:string}) {
 const tasks=searchTasks[id];
 if(!tasks)return null;
 return <section className="search-tasks" aria-label="Choose a calculation">
  <h2>Choose what to calculate</h2>
  {tasks.map(task=><div key={task.keyword}><h3>{task.keyword}</h3><p>{task.description}</p><a href={routeFor(id)+'?mode='+task.mode+'#calculator-panel'}>Open this calculation</a></div>)}
 </section>;
}
