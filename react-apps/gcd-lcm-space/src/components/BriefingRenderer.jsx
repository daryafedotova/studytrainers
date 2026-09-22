import { useState } from 'react';
import { ArrowRight, BookOpen, ChevronLeft } from 'lucide-react';

export const BRIEFINGS = {
  1: [
    {title:'Простое число', body:'Имеет ровно два натуральных делителя: 1 и само число.', example:'7 → делители 1 и 7'},
    {title:'Составное число', body:'Имеет больше двух натуральных делителей.', example:'12 → 1, 2, 3, 4, 6, 12'},
    {title:'А число 1?', body:'1 не является ни простым, ни составным.', example:'У 1 только один натуральный делитель.'}
  ],
  2: [
    {title:'Разложение', body:'Разложить число на простые множители — представить его произведением простых чисел.', example:'60 = 2 · 2 · 3 · 5'},
    {title:'Дерево множителей', body:'Разбивай составные ветви, пока на концах не останутся только простые числа.', example:'60 → 6 · 10 → 2 · 3 · 2 · 5'},
    {title:'Последовательное деление', body:'Дели число на простые числа 2, 3, 5, 7… пока не получишь 1.', example:'60 : 2 : 2 : 3 : 5'}
  ],
  3: [
    {title:'Повторяющиеся множители', body:'Одинаковые простые множители можно записать степенью.', example:'2 · 2 · 2 · 3 · 3 = 2³ · 3²'},
    {title:'Что показывает степень?', body:'Показатель степени показывает, сколько одинаковых множителей нужно взять.', example:'5³ = 5 · 5 · 5'}
  ],
  4: [
    {title:'Общая часть', body:'Сравни два разложения и сопоставь одинаковые простые множители.', example:'60 = 2² · 3 · 5; 90 = 2 · 3² · 5'},
    {title:'Не бери лишнее', body:'В общую часть множитель входит только столько раз, сколько он встречается в обоих числах.', example:'Общая часть 60 и 90: 2 · 3 · 5'}
  ]
};
export function BriefingRenderer({levelId,onDone}){const steps=BRIEFINGS[levelId]??[];const[index,setIndex]=useState(0);const step=steps[index];if(!step)return <button className="primary-button" onClick={onDone}>К миссии <ArrowRight size={18}/></button>;return <section className="briefing-card"><div className="briefing-badge"><BookOpen size={18}/> Бортовой журнал · {index+1}/{steps.length}</div><h2>{step.title}</h2><p>{step.body}</p><div className="briefing-example">{step.example}</div><div className="button-row briefing-actions">{index>0&&<button className="secondary-button" type="button" onClick={()=>setIndex(i=>i-1)}><ChevronLeft size={18}/> Назад</button>}<button className="primary-button" type="button" onClick={()=>index===steps.length-1?onDone():setIndex(i=>i+1)}>{index===steps.length-1?'Начать миссию':'Дальше'} <ArrowRight size={18}/></button></div></section>;}
