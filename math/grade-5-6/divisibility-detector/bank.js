export const ROUTES = {
  '5': [
    {id:'learn', title:'1. Запомни признаки', learningOnly:true},
    {id:'yes-no', title:'2. Делится или нет?'},
    {id:'detector', title:'3. Детектор делимости'},
    {id:'pair', title:'4. Что подходит обоим?'},
    {id:'fractions', title:'5. Сокращай дроби'},
  ],
  '6': [
    {id:'learn', title:'1. Вспомни признаки', learningOnly:true},
    {id:'yes-no', title:'2. Делится или нет?'},
    {id:'detector', title:'3. Детектор делимости'},
    {id:'pair', title:'4. Что подходит обоим?'},
    {id:'gcd', title:'5. Найди НОД'},
    {id:'gcd-fractions', title:'6. Сократи через НОД'},
  ],
};

export const RULES = {
  2: { short:'Последняя цифра — чётная: 0, 2, 4, 6 или 8.', strategy:'last-digit' },
  3: { short:'Сумма цифр делится на 3.', strategy:'digit-sum' },
  5: { short:'Последняя цифра — 0 или 5.', strategy:'last-digit' },
  9: { short:'Сумма цифр делится на 9.', strategy:'digit-sum' },
  10:{ short:'Последняя цифра — 0.', strategy:'last-digit' },
};

const learningTasks = [
  {id:'learn-strategies',type:'learn',learningOnly:true,skills:[],prompt:'Есть два способа проверки',stage:'strategies'},
  {id:'learn-2',type:'learn',learningOnly:true,skills:['2'],prompt:'Признак делимости на 2',stage:'rule',divisor:2,number:742},
  {id:'learn-5',type:'learn',learningOnly:true,skills:['5'],prompt:'Признак делимости на 5',stage:'rule',divisor:5,number:735},
  {id:'learn-10',type:'learn',learningOnly:true,skills:['10','5/10'],prompt:'Не перепутай 5 и 10',stage:'contrast',divisor:10,numbers:[735,730]},
  {id:'learn-3',type:'learn',learningOnly:true,skills:['3'],prompt:'Признак делимости на 3',stage:'rule',divisor:3,number:123},
  {id:'learn-9',type:'learn',learningOnly:true,skills:['9','3/9'],prompt:'Не перепутай 3 и 9',stage:'contrast',divisor:9,numbers:[123,126]},
  {id:'learn-check',type:'learn',learningOnly:true,skills:['2','3','5','9','10'],prompt:'Проверь, что запомнилось',stage:'check',number:540},
];

const yesNoTasks = [
  {id:'yn-738-3',type:'yes-no-reason',skills:['3'],prompt:'Делится ли 738 на 3?',number:738,divisor:3,
    reasons:[{id:'sum-18-div3',text:'7 + 3 + 8 = 18, а 18 делится на 3'},{id:'last-digit',text:'Последняя цифра 8'},{id:'ends-3',text:'Число заканчивается не на 3'}],answer:{yes:true,reasonId:'sum-18-div3'}},
  {id:'yn-742-2',type:'yes-no-reason',skills:['2'],prompt:'Делится ли 742 на 2?',number:742,divisor:2,
    reasons:[{id:'last-even',text:'Последняя цифра 2 — чётная'},{id:'sum',text:'7 + 4 + 2 = 13'},{id:'ends-2',text:'В числе есть цифра 2'}],answer:{yes:true,reasonId:'last-even'}},
  {id:'yn-735-10',type:'yes-no-reason',skills:['10','5/10'],prompt:'Делится ли 735 на 10?',number:735,divisor:10,
    reasons:[{id:'last-not-zero',text:'Последняя цифра 5, а для 10 нужна 0'},{id:'last-five',text:'Последняя цифра 5'},{id:'sum-15',text:'Сумма цифр равна 15'}],answer:{yes:false,reasonId:'last-not-zero'}},
  {id:'yn-730-10',type:'yes-no-reason',skills:['10','5/10'],prompt:'Делится ли 730 на 10?',number:730,divisor:10,
    reasons:[{id:'last-zero',text:'Последняя цифра 0'},{id:'sum-ten',text:'Сумма цифр равна 10'},{id:'even',text:'Число чётное'}],answer:{yes:true,reasonId:'last-zero'}},
  {id:'yn-123-9',type:'yes-no-reason',skills:['9','3/9'],prompt:'Делится ли 123 на 9?',number:123,divisor:9,
    reasons:[{id:'sum-six-not9',text:'1 + 2 + 3 = 6, а 6 не делится на 9'},{id:'sum-six-div3',text:'6 делится на 3'},{id:'last-three',text:'Последняя цифра 3'}],answer:{yes:false,reasonId:'sum-six-not9'}},
  {id:'yn-126-9',type:'yes-no-reason',skills:['9','3/9'],prompt:'Делится ли 126 на 9?',number:126,divisor:9,
    reasons:[{id:'sum-nine',text:'1 + 2 + 6 = 9, а 9 делится на 9'},{id:'last-six',text:'Последняя цифра 6'},{id:'even',text:'Число чётное'}],answer:{yes:true,reasonId:'sum-nine'}},
  {id:'yn-734-5',type:'yes-no-reason',skills:['5'],prompt:'Делится ли 734 на 5?',number:734,divisor:5,
    reasons:[{id:'last-not05',text:'Последняя цифра 4, а нужна 0 или 5'},{id:'sum14',text:'Сумма цифр равна 14'},{id:'even',text:'Число чётное'}],answer:{yes:false,reasonId:'last-not05'}},
  {id:'yn-540-5',type:'yes-no-reason',skills:['5','10'],prompt:'Делится ли 540 на 5?',number:540,divisor:5,
    reasons:[{id:'last-zero-five',text:'Последняя цифра 0 — это подходит для делимости на 5'},{id:'sum-nine',text:'Сумма цифр равна 9'},{id:'even',text:'Число чётное'}],answer:{yes:true,reasonId:'last-zero-five'}},
  {id:'yn-729-9',type:'yes-no-reason',skills:['9','3/9'],prompt:'Делится ли 729 на 9?',number:729,divisor:9,
    reasons:[{id:'sum18',text:'7 + 2 + 9 = 18, а 18 делится на 9'},{id:'last-nine',text:'Последняя цифра 9'},{id:'sum-div3',text:'18 делится на 3'}],answer:{yes:true,reasonId:'sum18'}},
  {id:'yn-124-3',type:'yes-no-reason',skills:['3'],prompt:'Делится ли 124 на 3?',number:124,divisor:3,
    reasons:[{id:'sum7',text:'1 + 2 + 4 = 7, а 7 не делится на 3'},{id:'last-four',text:'Последняя цифра 4'},{id:'even',text:'Число чётное'}],answer:{yes:false,reasonId:'sum7'}},
];

const detectorTasks = [
  {id:'det-735',type:'detector',skills:['3','5','5/10'],prompt:'Выбери все подходящие признаки',number:735},
  {id:'det-730',type:'detector',skills:['2','5','10','5/10'],prompt:'Выбери все подходящие признаки',number:730},
  {id:'det-123',type:'detector',skills:['3','9','3/9'],prompt:'Выбери все подходящие признаки',number:123},
  {id:'det-126',type:'detector',skills:['2','3','9','3/9'],prompt:'Выбери все подходящие признаки',number:126},
  {id:'det-540',type:'detector',skills:['2','3','5','9','10'],prompt:'Выбери все подходящие признаки',number:540},
  {id:'det-630',type:'detector',skills:['2','3','5','9','10'],prompt:'Выбери все подходящие признаки',number:630},
  {id:'det-729',type:'detector',skills:['3','9','3/9'],prompt:'Выбери все подходящие признаки',number:729},
  {id:'det-742',type:'detector',skills:['2'],prompt:'Выбери все подходящие признаки',number:742},
  {id:'det-734',type:'detector',skills:['2','5','10'],prompt:'Выбери все подходящие признаки',number:734},
  {id:'det-124',type:'detector',skills:['2','3'],prompt:'Выбери все подходящие признаки',number:124},
  {id:'det-error-435',type:'detector-error',skills:['3','5','10','5/10'],prompt:'Ученик отметил признаки. Найди ошибку.',number:435,shownDivisors:[3,5,10]},
];

const pairTasks = [
  {id:'pair-126-180',type:'pair',skills:['2','3','5','9','10'],prompt:'Что подходит обоим?',left:126,right:180},
  {id:'pair-42-108',type:'pair',skills:['2','3','9'],prompt:'Что подходит обоим?',left:42,right:108},
  {id:'pair-84-126',type:'pair',skills:['2','3','9'],prompt:'Что подходит обоим?',left:84,right:126},
  {id:'pair-14-25',type:'pair',skills:['2','5'],prompt:'Есть ли изученный признак, подходящий обоим?',left:14,right:25},
];

const grade5FractionTasks = [
  {id:'frac-126-180',type:'fraction-step',skills:['fraction','2','3','9'],prompt:'Сократи дробь по шагам',numerator:126,denominator:180},
  {id:'frac-error-150-216',type:'fraction-error',skills:['fraction','10'],prompt:'Найди ошибочный шаг',numerator:150,denominator:216,shownDivisor:10},
  {id:'frac-63-90',type:'fraction-step',skills:['fraction','3','5','9','10'],prompt:'Сократи дробь по шагам',numerator:63,denominator:90},
  {id:'frac-72-120',type:'fraction-step',skills:['fraction','2','3','5','10'],prompt:'Сократи дробь по шагам',numerator:72,denominator:120},
];

const gcdTasks = [
  {id:'gcd-84-126',type:'gcd',skills:['gcd-divisor','gcd-arithmetic','gcd-finish'],prompt:'Найди НОД',left:84,right:126},
  {id:'gcd-48-72',type:'gcd',skills:['gcd-divisor','gcd-arithmetic','gcd-finish'],prompt:'Найди НОД',left:48,right:72},
  {id:'gcd-36-108',type:'gcd',skills:['gcd-divisor','gcd-arithmetic','gcd-finish'],prompt:'Найди НОД',left:36,right:108},
  {id:'gcd-14-25',type:'gcd',skills:['gcd-divisor','gcd-finish'],prompt:'Найди НОД',left:14,right:25},
  {id:'gcd-error-48-72',type:'gcd-error',skills:['gcd-finish'],prompt:'Оцени готовое решение',left:48,right:72,claimedGcd:12,reduced:{numerator:4,denominator:6}},
];

const gcdFractionTasks = [
  {id:'gcd-frac-84-126',type:'fraction-gcd',skills:['gcd-divisor','gcd-arithmetic','gcd-finish','fraction'],prompt:'Сократи дробь через НОД',numerator:84,denominator:126},
  {id:'gcd-frac-48-72',type:'fraction-gcd',skills:['gcd-divisor','gcd-arithmetic','gcd-finish','fraction'],prompt:'Сократи дробь через НОД',numerator:48,denominator:72},
  {id:'gcd-frac-14-25',type:'fraction-gcd',skills:['gcd-divisor','gcd-finish','fraction'],prompt:'Можно ли сократить через НОД?',numerator:14,denominator:25},
];

export const TASK_BANK = {
  '5': {learn:learningTasks,'yes-no':yesNoTasks,detector:detectorTasks,pair:pairTasks,fractions:grade5FractionTasks},
  '6': {learn:learningTasks,'yes-no':yesNoTasks,detector:detectorTasks,pair:pairTasks,gcd:gcdTasks,'gcd-fractions':gcdFractionTasks},
};

export function tasksFor(grade, blockId) {
  return [...(TASK_BANK[String(grade)]?.[blockId] ?? [])];
}

export function blockFor(grade, blockId) {
  return ROUTES[String(grade)]?.find(block => block.id === blockId) ?? null;
}
