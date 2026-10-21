import { searchTasks } from '@/lib/keyword-targets';
import { routeFor } from '@/lib/catalog';
export default function SearchTasks({id}:{id:string}) {
 const tasks=searchTasks[id];
 if(!tasks)return null;
 return <section className="search-tasks" aria-label="Choose a calculation">
  <h2>Choose what to calculate</h2>
  {tasks.map(task=>{
   const query=new URLSearchParams({mode:task.mode,...task.values});
   const href=routeFor(id)+'?'+query.toString()+'#calculator-panel';
   return <div key={task.keyword}><h3>{task.keyword}</h3><p>{task.description}</p>
    {task.aliases?.length ? <p>Related searches: {task.aliases.map((keyword,index)=><span key={keyword}>{index>0?' · ':''}<a href={href}>{keyword}</a></span>)}</p>:null}
    <a href={href}>Open this calculation</a></div>;
  })}
 </section>;
}
