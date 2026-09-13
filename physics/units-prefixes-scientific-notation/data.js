export const PREFIXES = [
  {id:'giga', name:'гига', symbol:'Г', factor:1e9, exponent:9, modes:['89'], rare:false},
  {id:'mega', name:'мега', symbol:'М', factor:1e6, exponent:6, modes:['7','89'], rare:false},
  {id:'kilo', name:'кило', symbol:'к', factor:1e3, exponent:3, modes:['7','89'], rare:false},
  {id:'hecto', name:'гекто', symbol:'г', factor:1e2, exponent:2, modes:['89'], rare:true},
  {id:'deca', name:'дека', symbol:'да', factor:1e1, exponent:1, modes:['89'], rare:true},
  {id:'deci', name:'деци', symbol:'д', factor:1e-1, exponent:-1, modes:['89'], rare:true},
  {id:'centi', name:'санти', symbol:'с', factor:1e-2, exponent:-2, modes:['7','89'], rare:false},
  {id:'milli', name:'милли', symbol:'м', factor:1e-3, exponent:-3, modes:['7','89'], rare:false},
  {id:'micro', name:'микро', symbol:'мк', factor:1e-6, exponent:-6, modes:['89'], rare:false},
  {id:'nano', name:'нано', symbol:'н', factor:1e-9, exponent:-9, modes:['89'], rare:false},
];

const BOTH = ['7','89'];
const OLD = ['89'];

export const UNITS = [
  {id:'m',symbol:'м',dimension:'length',factorToSI:1,prefixId:null,modes:BOTH,systemUnitId:'m',power:1},
  {id:'km',symbol:'км',dimension:'length',factorToSI:1e3,prefixId:'kilo',modes:BOTH,systemUnitId:'m',power:1},
  {id:'cm',symbol:'см',dimension:'length',factorToSI:1e-2,prefixId:'centi',modes:BOTH,systemUnitId:'m',power:1},
  {id:'mm',symbol:'мм',dimension:'length',factorToSI:1e-3,prefixId:'milli',modes:BOTH,systemUnitId:'m',power:1},
  {id:'um',symbol:'мкм',dimension:'length',factorToSI:1e-6,prefixId:'micro',modes:OLD,systemUnitId:'m',power:1},
  {id:'nm',symbol:'нм',dimension:'length',factorToSI:1e-9,prefixId:'nano',modes:OLD,systemUnitId:'m',power:1},
  {id:'dm',symbol:'дм',dimension:'length',factorToSI:1e-1,prefixId:'deci',modes:OLD,systemUnitId:'m',power:1,rare:true},
  {id:'dam',symbol:'дам',dimension:'length',factorToSI:1e1,prefixId:'deca',modes:OLD,systemUnitId:'m',power:1,rare:true},

  {id:'s',symbol:'с',dimension:'time',factorToSI:1,prefixId:null,modes:BOTH,systemUnitId:'s',power:1},
  {id:'ms',symbol:'мс',dimension:'time',factorToSI:1e-3,prefixId:'milli',modes:BOTH,systemUnitId:'s',power:1},
  {id:'us',symbol:'мкс',dimension:'time',factorToSI:1e-6,prefixId:'micro',modes:OLD,systemUnitId:'s',power:1},
  {id:'ns',symbol:'нс',dimension:'time',factorToSI:1e-9,prefixId:'nano',modes:OLD,systemUnitId:'s',power:1},

  {id:'kg',symbol:'кг',dimension:'mass',factorToSI:1,prefixId:null,modes:BOTH,systemUnitId:'kg',power:1},
  {id:'g',symbol:'г',dimension:'mass',factorToSI:1e-3,prefixId:null,modes:BOTH,systemUnitId:'kg',power:1},
  {id:'mg',symbol:'мг',dimension:'mass',factorToSI:1e-6,prefixId:'milli',modes:BOTH,systemUnitId:'kg',power:1},

  {id:'N',symbol:'Н',dimension:'force',factorToSI:1,prefixId:null,modes:BOTH,systemUnitId:'N',power:1},
  {id:'kN',symbol:'кН',dimension:'force',factorToSI:1e3,prefixId:'kilo',modes:BOTH,systemUnitId:'N',power:1},
  {id:'daN',symbol:'даН',dimension:'force',factorToSI:1e1,prefixId:'deca',modes:OLD,systemUnitId:'N',power:1,rare:true},

  {id:'Pa',symbol:'Па',dimension:'pressure',factorToSI:1,prefixId:null,modes:BOTH,systemUnitId:'Pa',power:1},
  {id:'kPa',symbol:'кПа',dimension:'pressure',factorToSI:1e3,prefixId:'kilo',modes:BOTH,systemUnitId:'Pa',power:1},
  {id:'MPa',symbol:'МПа',dimension:'pressure',factorToSI:1e6,prefixId:'mega',modes:OLD,systemUnitId:'Pa',power:1},
  {id:'hPa',symbol:'гПа',dimension:'pressure',factorToSI:1e2,prefixId:'hecto',modes:OLD,systemUnitId:'Pa',power:1,rare:true},

  {id:'J',symbol:'Дж',dimension:'energy',factorToSI:1,prefixId:null,modes:BOTH,systemUnitId:'J',power:1},
  {id:'kJ',symbol:'кДж',dimension:'energy',factorToSI:1e3,prefixId:'kilo',modes:BOTH,systemUnitId:'J',power:1},
  {id:'MJ',symbol:'МДж',dimension:'energy',factorToSI:1e6,prefixId:'mega',modes:BOTH,systemUnitId:'J',power:1},

  {id:'W',symbol:'Вт',dimension:'power',factorToSI:1,prefixId:null,modes:BOTH,systemUnitId:'W',power:1},
  {id:'kW',symbol:'кВт',dimension:'power',factorToSI:1e3,prefixId:'kilo',modes:BOTH,systemUnitId:'W',power:1},
  {id:'MW',symbol:'МВт',dimension:'power',factorToSI:1e6,prefixId:'mega',modes:BOTH,systemUnitId:'W',power:1},

  {id:'A',symbol:'А',dimension:'current',factorToSI:1,prefixId:null,modes:OLD,systemUnitId:'A',power:1},
  {id:'mA',symbol:'мА',dimension:'current',factorToSI:1e-3,prefixId:'milli',modes:OLD,systemUnitId:'A',power:1},
  {id:'uA',symbol:'мкА',dimension:'current',factorToSI:1e-6,prefixId:'micro',modes:OLD,systemUnitId:'A',power:1},

  {id:'V',symbol:'В',dimension:'voltage',factorToSI:1,prefixId:null,modes:OLD,systemUnitId:'V',power:1},
  {id:'mV',symbol:'мВ',dimension:'voltage',factorToSI:1e-3,prefixId:'milli',modes:OLD,systemUnitId:'V',power:1},
  {id:'kV',symbol:'кВ',dimension:'voltage',factorToSI:1e3,prefixId:'kilo',modes:OLD,systemUnitId:'V',power:1},

  {id:'Hz',symbol:'Гц',dimension:'frequency',factorToSI:1,prefixId:null,modes:OLD,systemUnitId:'Hz',power:1},
  {id:'kHz',symbol:'кГц',dimension:'frequency',factorToSI:1e3,prefixId:'kilo',modes:OLD,systemUnitId:'Hz',power:1},
  {id:'MHz',symbol:'МГц',dimension:'frequency',factorToSI:1e6,prefixId:'mega',modes:OLD,systemUnitId:'Hz',power:1},
  {id:'GHz',symbol:'ГГц',dimension:'frequency',factorToSI:1e9,prefixId:'giga',modes:OLD,systemUnitId:'Hz',power:1},

  {id:'m2',symbol:'м²',dimension:'area',factorToSI:1,prefixId:null,modes:BOTH,systemUnitId:'m2',power:2},
  {id:'cm2',symbol:'см²',dimension:'area',factorToSI:1e-4,prefixId:'centi',modes:BOTH,systemUnitId:'m2',power:2},
  {id:'mm2',symbol:'мм²',dimension:'area',factorToSI:1e-6,prefixId:'milli',modes:BOTH,systemUnitId:'m2',power:2},

  {id:'m3',symbol:'м³',dimension:'volume',factorToSI:1,prefixId:null,modes:BOTH,systemUnitId:'m3',power:3},
  {id:'dm3',symbol:'дм³',dimension:'volume',factorToSI:1e-3,prefixId:'deci',modes:BOTH,systemUnitId:'m3',power:3},
  {id:'cm3',symbol:'см³',dimension:'volume',factorToSI:1e-6,prefixId:'centi',modes:BOTH,systemUnitId:'m3',power:3},
  {id:'L',symbol:'л',dimension:'volume',factorToSI:1e-3,prefixId:null,modes:BOTH,systemUnitId:'m3',power:3},
  {id:'mL',symbol:'мл',dimension:'volume',factorToSI:1e-6,prefixId:'milli',modes:BOTH,systemUnitId:'m3',power:3},
];

export const MODE_BLOCKS = {
  '7': ['prefix-drill','to-si','use-prefix','mixed','area-volume'],
  '89': ['mantissa-warmup','to-scientific','from-scientific','prefix-drill','prefix-power','mantissa-shift','unit-conversion','mixed','area-volume'],
};

const prefixById = new Map(PREFIXES.map(prefix => [prefix.id, prefix]));
const unitById = new Map(UNITS.map(unit => [unit.id, unit]));

export function getPrefix(id) {
  const prefix = prefixById.get(id);
  if (!prefix) throw new RangeError(`unknown prefix: ${id}`);
  return prefix;
}

export function getUnit(id) {
  const unit = unitById.get(id);
  if (!unit) throw new RangeError(`unknown unit: ${id}`);
  return unit;
}

export function unitsForMode(mode) {
  if (!MODE_BLOCKS[mode]) throw new RangeError(`unknown mode: ${mode}`);
  return UNITS.filter(unit => unit.modes.includes(mode));
}
