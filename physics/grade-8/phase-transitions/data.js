export const ANSWER_OPTIONS = {
  process:[
    ['melting','Плавление'],['crystallization','Кристаллизация'],['boiling','Кипение'],['condensation','Конденсация']
  ],
  transition:[
    ['solid-liquid','Твёрдое → жидкое'],['liquid-solid','Жидкое → твёрдое'],['liquid-gas','Жидкое → газообразное'],['gas-liquid','Газообразное → жидкое']
  ],
  state:[
    ['solid-liquid','Твёрдое + жидкое'],['liquid-gas','Жидкость + пар'],['solid','Только твёрдое'],['liquid','Только жидкость'],['gas','Только газ']
  ],
  tempChange:[['constant','Не изменяется'],['changes','Изменяется']],
  energy:[['increases','Увеличивается'],['decreases','Уменьшается']]
};

const p=(x,y,label='')=>({x,y,label});

export const LEVEL1_TASKS = [
  {id:'l1-1',title:'Плавление льда',points:[p(0,-20),p(2,0),p(5,0),p(8,40)],highlightSegment:1,
    answer:{process:'melting',transition:'solid-liquid',state:'solid-liquid',tempChange:'constant',energy:'increases',temperature:0},
    hint:'До горизонтального участка температура росла: вещество нагревают.'},
  {id:'l1-2',title:'Кристаллизация воды',points:[p(0,30),p(3,0),p(6,0),p(9,-20)],highlightSegment:1,
    answer:{process:'crystallization',transition:'liquid-solid',state:'solid-liquid',tempChange:'constant',energy:'decreases',temperature:0},
    hint:'После участка температура продолжает уменьшаться: идёт охлаждение.'},
  {id:'l1-3',title:'Кипение воды',points:[p(0,20),p(4,100),p(7,100),p(10,130)],highlightSegment:1,
    answer:{process:'boiling',transition:'liquid-gas',state:'liquid-gas',tempChange:'constant',energy:'increases',temperature:100},
    hint:'Вещество нагревают и оно переходит из жидкости в пар.'},
  {id:'l1-4',title:'Конденсация пара',points:[p(0,140),p(3,100),p(6,100),p(10,40)],highlightSegment:1,
    answer:{process:'condensation',transition:'gas-liquid',state:'liquid-gas',tempChange:'constant',energy:'decreases',temperature:100},
    hint:'Температура до и после участка уменьшается.'},
  {id:'l1-5',title:'Плавление неизвестного вещества',points:[p(0,-10),p(3,35),p(6,35),p(9,70)],highlightSegment:1,
    answer:{process:'melting',transition:'solid-liquid',state:'solid-liquid',tempChange:'constant',energy:'increases',temperature:35},
    hint:'Температура плавления не обязана быть равна 0 °C.'},
  {id:'l1-6',title:'Кристаллизация неизвестного вещества',points:[p(0,80),p(3,35),p(6,35),p(10,-15)],highlightSegment:1,
    answer:{process:'crystallization',transition:'liquid-solid',state:'solid-liquid',tempChange:'constant',energy:'decreases',temperature:35},
    hint:'Один температурный уровень может соответствовать прямому и обратному переходу — смотри на направление процесса.'},
  {id:'l1-7',title:'Кипение жидкости',points:[p(0,25),p(3,80),p(7,80),p(10,110)],highlightSegment:1,
    answer:{process:'boiling',transition:'liquid-gas',state:'liquid-gas',tempChange:'constant',energy:'increases',temperature:80},
    hint:'Разные вещества кипят при разных температурах.'},
  {id:'l1-8',title:'Конденсация пара',points:[p(0,120),p(2,80),p(6,80),p(10,30)],highlightSegment:1,
    answer:{process:'condensation',transition:'gas-liquid',state:'liquid-gas',tempChange:'constant',energy:'decreases',temperature:80},
    hint:'Посмотри на направление изменения температуры.'},
  {id:'l1-9',title:'Первый переход при нагревании',points:[p(0,-30),p(2,20),p(4,20),p(7,90),p(9,90),p(11,120)],highlightSegment:1,
    answer:{process:'melting',transition:'solid-liquid',state:'solid-liquid',tempChange:'constant',energy:'increases',temperature:20},
    hint:'Какое агрегатное состояние было до первого горизонтального участка?'},
  {id:'l1-10',title:'Первый переход при охлаждении',points:[p(0,130),p(2,90),p(5,90),p(8,20),p(10,20),p(12,-10)],highlightSegment:1,
    answer:{process:'condensation',transition:'gas-liquid',state:'liquid-gas',tempChange:'constant',energy:'decreases',temperature:90},
    hint:'При охлаждении сначала конденсируется газ, затем кристаллизуется жидкость.'}
];

export const LEVEL2_TASKS = [
  {id:'l2-1',points:[p(0,-20,'A'),p(2,0,'B'),p(5,0,'C'),p(8,60,'D'),p(10,100,'E'),p(13,100,'F'),p(15,120,'G')],
    question:'На каком участке происходит плавление?',answerType:'segment',answer:1,hint:'Ищи горизонтальный участок, где твёрдое вещество превращается в жидкость.'},
  {id:'l2-2',points:[p(0,-15,'A'),p(2,35,'B'),p(5,35,'C'),p(8,95,'D')],
    question:'При какой температуре происходит плавление?',answerType:'number',answer:35,hint:'Считай значение по вертикальной оси у горизонтального участка.'},
  {id:'l2-3',points:[p(0,130,'A'),p(3,90,'B'),p(6,90,'C'),p(9,20,'D'),p(12,20,'E'),p(14,-10,'F')],
    question:'Какой процесс происходит на участке BC?',answerType:'singleChoice',answer:'condensation',
    options:[['melting','Плавление'],['crystallization','Кристаллизация'],['boiling','Кипение'],['condensation','Конденсация']],hint:'Вещество охлаждается. Что происходит с паром при постоянной температуре?'},
  {id:'l2-4',points:[p(0,-10,'A'),p(3,25,'B'),p(6,25,'C'),p(9,70,'D')],
    question:'В каком агрегатном состоянии находится вещество в середине участка BC?',answerType:'singleChoice',answer:'solid-liquid',
    options:[['solid','Только твёрдое'],['solid-liquid','Твёрдое + жидкое'],['liquid','Только жидкость'],['liquid-gas','Жидкость + пар']],hint:'Фазовый переход ещё не завершён: одновременно существуют две фазы.'},
  {id:'l2-5',points:[p(0,15,'A'),p(3,80,'B'),p(6,80,'C'),p(9,110,'D')],
    question:'На каком участке одновременно существуют жидкость и пар?',answerType:'segment',answer:1,hint:'Это происходит во время перехода жидкость → газ.'},
  {id:'l2-6',points:[p(0,70,'A'),p(3,30,'B'),p(6,30,'C'),p(9,-10,'D')],
    question:'Как изменяется внутренняя энергия вещества на участке BC?',answerType:'singleChoice',answer:'decreases',
    options:[['increases','Увеличивается'],['decreases','Уменьшается']],hint:'Процесс идёт при охлаждении.'},
  {id:'l2-7',points:[p(0,120,'A'),p(3,80,'B'),p(6,80,'C'),p(9,25,'D')],
    question:'Какой переход происходит на участке BC?',answerType:'singleChoice',answer:'gas-liquid',
    options:[['solid-liquid','Твёрдое → жидкое'],['liquid-solid','Жидкое → твёрдое'],['liquid-gas','Жидкое → газообразное'],['gas-liquid','Газообразное → жидкое']],hint:'Определи состояние вещества до и после горизонтального участка.'},
  {id:'l2-8',points:[p(0,-20,'A'),p(2,20,'B'),p(4,20,'C'),p(7,90,'D'),p(9,90,'E'),p(11,120,'F')],
    question:'На каком участке нагревается жидкость без изменения агрегатного состояния?',answerType:'segment',answer:2,hint:'Жидкость уже расплавилась, но ещё не начала кипеть.'},
  {id:'l2-9',points:[p(0,20,'A'),p(3,80,'B'),p(7,80,'C'),p(10,115,'D')],
    question:'Какова температура кипения вещества?',answerType:'number',answer:80,hint:'Найди горизонтальный участок кипения и считай его температуру.'},
  {id:'l2-10',points:[p(0,140,'A'),p(2,95,'B'),p(5,95,'C'),p(8,30,'D'),p(11,30,'E'),p(13,-15,'F')],
    question:'Какие фазовые переходы происходят на этом графике?',answerType:'multiChoice',answer:['condensation','crystallization'],
    options:[['melting','Плавление'],['crystallization','Кристаллизация'],['boiling','Кипение'],['condensation','Конденсация']],hint:'Выбери только процессы изменения агрегатного состояния при охлаждении.'}
];

export const BONUS_TASKS = [
  {id:'b1',title:'Два перехода: нагревание',text:'Твёрдое вещество при −20 °C нагревали. При 20 °C оно плавилось. После плавления жидкость нагрели до 90 °C, где она кипела, затем пар нагрели до 120 °C.',
    expectedTemps:[-20,20,20,90,90,120],minTemp:-20,maxTemp:120,step:10,enforceX:false,hints:['Нужны две горизонтали.','Первая горизонталь — 20 °C.','Вторая горизонталь — 90 °C.']},
  {id:'b2',title:'Два перехода: охлаждение',text:'Газ при 130 °C охлаждали. При 80 °C произошла конденсация. Затем жидкость охладили до 30 °C, при 30 °C она кристаллизовалась, после чего твёрдое вещество охладили до −10 °C.',
    expectedTemps:[130,80,80,30,30,-10],minTemp:-10,maxTemp:130,step:10,enforceX:false,hints:['График в целом идёт вниз.','Конденсация — горизонталь 80 °C.','Кристаллизация — горизонталь 30 °C.']},
  {id:'b3',title:'Вода: от льда до пара',text:'Лёд при −15 °C нагрели до 0 °C, расплавили, воду нагрели до 100 °C, полностью превратили в пар и продолжили нагревание до 120 °C.',
    expectedTemps:[-15,0,0,100,100,120],minTemp:-20,maxTemp:120,step:5,enforceX:false,hints:['Плавление льда — при 0 °C.','Кипение воды — при 100 °C.']},
  {id:'b4',title:'Неизвестное вещество',text:'Вещество при 10 °C нагревают до 140 °C. Температура плавления 45 °C, температура кипения 110 °C. Построй график всего процесса.',
    expectedTemps:[10,45,45,110,110,140],minTemp:0,maxTemp:140,step:5,enforceX:false,hints:['Горизонтали должны быть на 45 °C и 110 °C.']},
  {id:'b5',title:'Смена направления',text:'Твёрдое вещество нагрели: оно плавилось при 30 °C и кипело при 90 °C. Газ нагрели до 120 °C, затем начали охлаждать. При 90 °C пар сконденсировался. Охлаждение прекратили при 50 °C.',
    expectedTemps:[-10,30,30,90,90,120,90,90,50],minTemp:-10,maxTemp:120,step:10,enforceX:false,hints:['После 120 °C направление графика меняется.','На 90 °C горизонталь встречается и при кипении, и при конденсации.']},
  {id:'b6',title:'Полный цикл',text:'Твёрдое вещество при −20 °C нагрели до газа: оно плавилось при 20 °C и кипело при 80 °C. Газ нагрели до 110 °C, затем охладили обратно до −10 °C. При 80 °C шла конденсация, при 20 °C — кристаллизация.',
    expectedTemps:[-20,20,20,80,80,110,80,80,20,20,-10],minTemp:-20,maxTemp:110,step:10,enforceX:false,hints:['Сначала две горизонтали при нагревании.','После максимума график идёт вниз.','При охлаждении повторяются уровни 80 °C и 20 °C.']}
];
