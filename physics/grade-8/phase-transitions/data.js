export const ANSWER_OPTIONS = {
  action:[['heating','Нагревание'],['cooling','Охлаждение']],
  phaseState:[['solid','Твёрдое'],['liquid','Жидкое'],['gas','Газообразное']],
  process:[
    ['melting','Плавление'],['crystallization','Кристаллизация'],['boiling','Кипение'],['condensation','Конденсация']
  ],
  transition:[
    ['solid-liquid','Твёрдое → жидкое'],['liquid-solid','Жидкое → твёрдое'],['liquid-gas','Жидкое → газообразное'],['gas-liquid','Газообразное → жидкое']
  ],
  state:[
    ['solid-liquid','Твёрдое + жидкое'],['liquid-gas','Жидкость + пар']
  ],
  tempChange:[['increases','Увеличивается'],['decreases','Уменьшается'],['constant','Не изменяется']],
  energy:[['increases','Увеличивается'],['decreases','Уменьшается']]
};

const p=(x,y,label='')=>({x,y,label});

const H1=[p(0,-30),p(2,20),p(4,20),p(7,90),p(9,90),p(11,120)];
const H2=[p(0,-15),p(3,35),p(5,35),p(8,80),p(10,80),p(13,115)];
const C1=[p(0,130),p(2,90),p(5,90),p(8,20),p(10,20),p(12,-10)];
const C2=[p(0,120),p(3,80),p(6,80),p(9,30),p(11,30),p(14,-20)];

export const LEVEL1_TASKS = [
  {id:'l1-hs-1',category:'heating-solid',kind:'slope',context:'Неизвестное вещество · начальная температура −30 °C',points:H1,highlightSegment:0,answer:{action:'heating',phaseState:'solid',tempChange:'increases',energy:'increases'},hint:'Выделенный участок идёт вверх и расположен до первого фазового перехода.'},
  {id:'l1-hs-2',category:'heating-solid',kind:'slope',context:'Неизвестное вещество · начальная температура −15 °C',points:H2,highlightSegment:0,answer:{action:'heating',phaseState:'solid',tempChange:'increases',energy:'increases'},hint:'До первой горизонтальной площадки вещество ещё остаётся твёрдым.'},

  {id:'l1-m-1',category:'melting',kind:'phase',context:'Неизвестное вещество · начальная температура −30 °C',points:H1,highlightSegment:1,answer:{process:'melting',transition:'solid-liquid',state:'solid-liquid',tempChange:'constant',energy:'increases',temperature:20},hint:'Перед выделенным участком нагревается твёрдое вещество.'},
  {id:'l1-m-2',category:'melting',kind:'phase',context:'Неизвестное вещество · начальная температура −15 °C',points:H2,highlightSegment:1,answer:{process:'melting',transition:'solid-liquid',state:'solid-liquid',tempChange:'constant',energy:'increases',temperature:35},hint:'Первая горизонтальная площадка при нагревании соответствует переходу твёрдое → жидкое.'},

  {id:'l1-hl-1',category:'heating-liquid',kind:'slope',context:'Неизвестное вещество · нагревание продолжается',points:H1,highlightSegment:2,answer:{action:'heating',phaseState:'liquid',tempChange:'increases',energy:'increases'},hint:'Этот участок находится между плавлением и кипением.'},
  {id:'l1-hl-2',category:'heating-liquid',kind:'slope',context:'Неизвестное вещество · нагревание продолжается',points:H2,highlightSegment:2,answer:{action:'heating',phaseState:'liquid',tempChange:'increases',energy:'increases'},hint:'После первого фазового перехода и до второго вещество жидкое.'},

  {id:'l1-b-1',category:'boiling',kind:'phase',context:'Неизвестное вещество · нагревание',points:H1,highlightSegment:3,answer:{process:'boiling',transition:'liquid-gas',state:'liquid-gas',tempChange:'constant',energy:'increases',temperature:90},hint:'Это вторая горизонтальная площадка при нагревании.'},
  {id:'l1-b-2',category:'boiling',kind:'phase',context:'Неизвестное вещество · нагревание',points:H2,highlightSegment:3,answer:{process:'boiling',transition:'liquid-gas',state:'liquid-gas',tempChange:'constant',energy:'increases',temperature:80},hint:'Жидкость превращается в газ при постоянной температуре.'},

  {id:'l1-hg-1',category:'heating-gas',kind:'slope',context:'Неизвестное вещество · нагревание продолжается',points:H1,highlightSegment:4,answer:{action:'heating',phaseState:'gas',tempChange:'increases',energy:'increases'},hint:'Этот участок идёт после кипения.'},
  {id:'l1-hg-2',category:'heating-gas',kind:'slope',context:'Неизвестное вещество · нагревание продолжается',points:H2,highlightSegment:4,answer:{action:'heating',phaseState:'gas',tempChange:'increases',energy:'increases'},hint:'После второй горизонтальной площадки вещество уже газообразное.'},

  {id:'l1-cg-1',category:'cooling-gas',kind:'slope',context:'Неизвестное вещество · начальная температура 130 °C',points:C1,highlightSegment:0,answer:{action:'cooling',phaseState:'gas',tempChange:'decreases',energy:'decreases'},hint:'График идёт вниз, а участок расположен до первой площадки охлаждения.'},
  {id:'l1-cg-2',category:'cooling-gas',kind:'slope',context:'Неизвестное вещество · начальная температура 120 °C',points:C2,highlightSegment:0,answer:{action:'cooling',phaseState:'gas',tempChange:'decreases',energy:'decreases'},hint:'До конденсации вещество находится в газообразном состоянии.'},

  {id:'l1-cond-1',category:'condensation',kind:'phase',context:'Неизвестное вещество · охлаждение',points:C1,highlightSegment:1,answer:{process:'condensation',transition:'gas-liquid',state:'liquid-gas',tempChange:'constant',energy:'decreases',temperature:90},hint:'Первая горизонтальная площадка при охлаждении соответствует переходу газ → жидкость.'},
  {id:'l1-cond-2',category:'condensation',kind:'phase',context:'Неизвестное вещество · охлаждение',points:C2,highlightSegment:1,answer:{process:'condensation',transition:'gas-liquid',state:'liquid-gas',tempChange:'constant',energy:'decreases',temperature:80},hint:'На этом участке пар и жидкость существуют одновременно.'},

  {id:'l1-cl-1',category:'cooling-liquid',kind:'slope',context:'Неизвестное вещество · охлаждение продолжается',points:C1,highlightSegment:2,answer:{action:'cooling',phaseState:'liquid',tempChange:'decreases',energy:'decreases'},hint:'Участок расположен между конденсацией и кристаллизацией.'},
  {id:'l1-cl-2',category:'cooling-liquid',kind:'slope',context:'Неизвестное вещество · охлаждение продолжается',points:C2,highlightSegment:2,answer:{action:'cooling',phaseState:'liquid',tempChange:'decreases',energy:'decreases'},hint:'После конденсации, но до кристаллизации вещество жидкое.'},

  {id:'l1-cr-1',category:'crystallization',kind:'phase',context:'Неизвестное вещество · охлаждение',points:C1,highlightSegment:3,answer:{process:'crystallization',transition:'liquid-solid',state:'solid-liquid',tempChange:'constant',energy:'decreases',temperature:20},hint:'Это вторая горизонтальная площадка при охлаждении.'},
  {id:'l1-cr-2',category:'crystallization',kind:'phase',context:'Неизвестное вещество · охлаждение',points:C2,highlightSegment:3,answer:{process:'crystallization',transition:'liquid-solid',state:'solid-liquid',tempChange:'constant',energy:'decreases',temperature:30},hint:'Жидкость превращается в твёрдое вещество при постоянной температуре.'},

  {id:'l1-cs-1',category:'cooling-solid',kind:'slope',context:'Неизвестное вещество · охлаждение продолжается',points:C1,highlightSegment:4,answer:{action:'cooling',phaseState:'solid',tempChange:'decreases',energy:'decreases'},hint:'Этот участок находится после кристаллизации.'},
  {id:'l1-cs-2',category:'cooling-solid',kind:'slope',context:'Неизвестное вещество · охлаждение продолжается',points:C2,highlightSegment:4,answer:{action:'cooling',phaseState:'solid',tempChange:'decreases',energy:'decreases'},hint:'После второй горизонтальной площадки вещество уже твёрдое.'}
];

export const LEVEL2_TASKS = [
  {id:'l2-1',focus:'heating-solid',points:[p(0,-20,'A'),p(2,0,'B'),p(5,0,'C'),p(8,60,'D'),p(10,100,'E'),p(13,100,'F'),p(15,120,'G')],question:'На каком участке нагревается твёрдое тело?',answerType:'segment',answer:0,hint:'Ищи наклонный участок до плавления.'},
  {id:'l2-2',focus:'heating-liquid',points:[p(0,-10,'A'),p(2,25,'B'),p(4,25,'C'),p(7,80,'D'),p(10,80,'E'),p(12,110,'F')],question:'Что происходит с веществом на участке CD?',answerType:'singleChoice',answer:'heating',options:[['heating','Нагревание жидкости'],['cooling','Охлаждение жидкости'],['melting','Плавление'],['boiling','Кипение']],hint:'Участок идёт вверх и расположен между двумя фазовыми переходами.'},
  {id:'l2-3',focus:'cooling-gas',points:[p(0,130,'A'),p(3,90,'B'),p(6,90,'C'),p(9,20,'D'),p(12,20,'E'),p(14,-10,'F')],question:'На каком участке охлаждается газ?',answerType:'segment',answer:0,hint:'До конденсации газ охлаждается на первом наклонном участке.'},
  {id:'l2-4',focus:'cooling-liquid',points:[p(0,120,'A'),p(3,80,'B'),p(6,80,'C'),p(9,30,'D'),p(11,30,'E'),p(14,-20,'F')],question:'В каком агрегатном состоянии находится вещество на участке CD?',answerType:'singleChoice',answer:'liquid',options:[['solid','Твёрдое'],['liquid','Жидкое'],['gas','Газообразное'],['liquid-gas','Жидкость + пар']],hint:'Участок расположен после конденсации и до кристаллизации.'},
  {id:'l2-5',focus:'phase-boiling',points:[p(0,15,'A'),p(3,80,'B'),p(6,80,'C'),p(9,110,'D')],question:'На каком участке происходит кипение?',answerType:'segment',answer:1,hint:'Ищи горизонтальный участок перехода жидкость → газ.'},
  {id:'l2-6',focus:'phase-melting-temperature',points:[p(0,-15,'A'),p(2,35,'B'),p(5,35,'C'),p(8,95,'D')],question:'При какой температуре происходит плавление?',answerType:'number',answer:35,hint:'Считай значение по вертикальной оси у первой горизонтальной площадки.'},
  {id:'l2-7',focus:'cooling-solid',points:[p(0,70,'A'),p(2,30,'B'),p(5,30,'C'),p(8,-10,'D')],question:'Как изменяется внутренняя энергия твёрдого вещества на участке CD?',answerType:'singleChoice',answer:'decreases',options:[['increases','Увеличивается'],['decreases','Уменьшается']],hint:'Температура твёрдого тела уменьшается.'},
  {id:'l2-8',focus:'cooling-liquid-segment',points:[p(0,140,'A'),p(2,95,'B'),p(5,95,'C'),p(8,30,'D'),p(11,30,'E'),p(13,-15,'F')],question:'На каком участке охлаждается жидкость без изменения агрегатного состояния?',answerType:'segment',answer:2,hint:'Это наклонный участок между конденсацией и кристаллизацией.'},
  {id:'l2-9',focus:'phase-condensation',points:[p(0,120,'A'),p(3,80,'B'),p(6,80,'C'),p(9,25,'D')],question:'Какой процесс происходит на участке BC?',answerType:'singleChoice',answer:'condensation',options:[['melting','Плавление'],['crystallization','Кристаллизация'],['boiling','Кипение'],['condensation','Конденсация']],hint:'Вещество охлаждается, а газ превращается в жидкость.'},
  {id:'l2-10',focus:'phase-cooling-pair',points:[p(0,140,'A'),p(2,95,'B'),p(5,95,'C'),p(8,30,'D'),p(11,30,'E'),p(13,-15,'F')],question:'Какие фазовые переходы происходят на этом графике?',answerType:'multiChoice',answer:['condensation','crystallization'],options:[['melting','Плавление'],['crystallization','Кристаллизация'],['boiling','Кипение'],['condensation','Конденсация']],hint:'Выбери две горизонтальные площадки процесса охлаждения.'}
];

export const BONUS_TASKS = [
  {id:'b1',title:'Два перехода: нагревание',text:'Твёрдое вещество при −20 °C нагревали. При 20 °C оно плавилось. После плавления жидкость нагрели до 90 °C, где она кипела, затем пар нагрели до 120 °C.',expectedTemps:[-20,20,20,90,90,120],minTemp:-20,maxTemp:120,step:10,enforceX:false,hints:['Нужны две горизонтали.','Первая горизонталь — 20 °C.','Вторая горизонталь — 90 °C.']},
  {id:'b2',title:'Два перехода: охлаждение',text:'Газ при 130 °C охлаждали. При 80 °C произошла конденсация. Затем жидкость охладили до 30 °C, при 30 °C она кристаллизовалась, после чего твёрдое вещество охладили до −10 °C.',expectedTemps:[130,80,80,30,30,-10],minTemp:-10,maxTemp:130,step:10,enforceX:false,hints:['График в целом идёт вниз.','Конденсация — горизонталь 80 °C.','Кристаллизация — горизонталь 30 °C.']},
  {id:'b3',title:'Вода: от льда до пара',text:'Лёд при −15 °C нагрели до 0 °C, расплавили, воду нагрели до 100 °C, полностью превратили в пар и продолжили нагревание до 120 °C.',expectedTemps:[-15,0,0,100,100,120],minTemp:-20,maxTemp:120,step:5,enforceX:false,hints:['Плавление льда — при 0 °C.','Кипение воды — при 100 °C.']},
  {id:'b4',title:'Неизвестное вещество',text:'Вещество при 10 °C нагревают до 140 °C. Температура плавления 45 °C, температура кипения 110 °C. Построй график всего процесса.',expectedTemps:[10,45,45,110,110,140],minTemp:0,maxTemp:140,step:5,enforceX:false,hints:['Горизонтали должны быть на 45 °C и 110 °C.']},
  {id:'b5',title:'Смена направления',text:'Твёрдое вещество при −10 °C начали нагревать. При 30 °C оно плавилось, при 90 °C кипело. Газ нагрели до 120 °C, затем начали охлаждать. При 90 °C пар сконденсировался. Охлаждение прекратили при 50 °C.',expectedTemps:[-10,30,30,90,90,120,90,90,50],minTemp:-10,maxTemp:120,step:10,enforceX:false,hints:['После 120 °C направление графика меняется.','На 90 °C горизонталь встречается и при кипении, и при конденсации.']},
  {id:'b6',title:'Полный цикл',text:'Твёрдое вещество при −20 °C нагрели до газа: оно плавилось при 20 °C и кипело при 80 °C. Газ нагрели до 110 °C, затем охладили обратно до −10 °C. При 80 °C шла конденсация, при 20 °C — кристаллизация.',expectedTemps:[-20,20,20,80,80,110,80,80,20,20,-10],minTemp:-20,maxTemp:110,step:10,enforceX:false,hints:['Сначала две горизонтали при нагревании.','После максимума график идёт вниз.','При охлаждении повторяются уровни 80 °C и 20 °C.']}
];
